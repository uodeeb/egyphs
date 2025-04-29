import fetch from 'node-fetch';
import fs from 'fs/promises';
import path from 'path';
import { Buffer } from 'buffer';
import sizeOf from 'image-size';

// API Keys Configuration
const API_KEYS = {
  PIXABAY: '49902789-c35dea76da0247000eac1fe9d',  // Your Pixabay API key
  UNSPLASH: '5_8pjNJGGNEqDSHMHI0hHokVxbYCPgtO6dkvem6XBvA', // Add your Unsplash access key here
  GEMENI: 'AIzaSyBepU0vHmf_Yw2brXrt_Wg52PC5hi4JWtI'
};

// Base URLs for different APIs
const API_URLS = {
  WIKIMEDIA: 'https://commons.wikimedia.org/w/api.php',
  PIXABAY: 'https://pixabay.com/api',
  UNSPLASH: 'https://api.unsplash.com',
};

type ImageSource = 'wikimedia' | 'pixabay' | 'unsplash';

interface ImageSearchResult {
  url: string;
  width: number;
  height: number;
  source: ImageSource;
  title: string;
  relevanceScore: number;
}

// Configuration for image downloads
const CONFIG = {
  MAX_CONCURRENT_DOWNLOADS: 3,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
  RATE_LIMIT_DELAY: 1000,
  SUPPORTED_FORMATS: ['jpeg', 'jpg', 'png', 'webp'],
  MIN_IMAGE_WIDTH: 800,
  MIN_IMAGE_HEIGHT: 600,
  RELEVANCE_THRESHOLD: 0.6,
  MAX_WIKIMEDIA_BATCH: 20,
};

/*
 * Revised queryFilenameMap based on articlesData.md
 * Aimed at finding relevant images on Wikimedia Commons.
 * Uses alt text and captions from articlesData.md for better specificity.
 */
const queryFilenameMap: { [filename: string]: string } = {

  // ==================================
  // Article: gods-family-tree (egyptian-gods-family-tree-pantheon)
  // ==================================
  "/images/articles/egyptian-pantheon-overview.jpg": "Major Egyptian deities representation", // Query reflects the visual goal
  "/images/articles/creation-myth-papyrus.jpg": "Papyrus Atum creation Shu Tefnut Nun", // Specific elements from caption/alt
  "/images/articles/ennead-family-tree-diagram.png": "Diagram Egyptian Ennead family tree", // Diagrams might be custom, but this is the best search term
  "/images/articles/amun-ra-statue-karnak.jpg": "Statue Amun-Ra Karnak Temple", // Specific subject and location
  "/images/articles/ra-solar-barque-relief.jpg": "Relief Ra solar barque Egypt", // Specific subject and type
  "/images/articles/bes-taweret-amulets.jpg": "Faience amulets Bes Taweret Egypt", // Specific subjects, material, type
  "/images/articles/thoth-statue-scribe.jpg": "Statue Thoth ibis form Egypt", // Specific subject and form
  "/images/articles/isis-mourning-osiris-relief.jpg": "Relief Isis mourning Osiris Egypt", // Specific scene and type

  // ==================================
  // Article: book-of-dead-guide (egyptian-book-of-the-dead-afterlife-guide)
  // ==================================
  "/images/articles/book-of-dead-papyrus-hunefer.jpg": "Papyrus of Hunefer Weighing of the Heart", // Very specific, well-known papyrus/scene
  "/images/articles/book-of-dead-scroll-display.jpg": "Papyrus Book of the Dead display", // Describes the scene
  "/images/articles/weighing-of-the-heart-detail.jpg": "Weighing of the Heart papyrus detail", // Specific scene, emphasizing detail
  "/images/articles/duat-journey-map-diagram.png": "Diagram Egyptian Duat journey Book of Gates Amduat", // Search for diagrams based on texts
  "/images/articles/book-of-dead-quality-comparison.jpg": "Papyrus Book of the Dead detailed vignette comparison", // Search for detailed examples, comparison might be hard to find directly
  "/images/articles/book-of-dead-vignette-closeup.jpg": "Papyrus Book of the Dead vignette detail", // Focus on detailed illustration

  // ==================================
  // Article: mummification-process-detailed (ancient-egyptian-mummification-process-70-days)
  // ==================================
  "/images/articles/mummification-anubis-scene.jpg": "Anubis tending mummy painting tomb", // Specific scene and context
  "/images/articles/ka-ba-akh-diagram.png": "Diagram Egyptian soul Ka Ba Akh", // Search for conceptual diagram
  "/images/articles/embalmers-workshop-reconstruction.jpg": "Reconstruction Egyptian embalmers workshop", // Search for reconstructions
  "/images/articles/canopic-jars-set.jpg": "Canopic jars Sons of Horus set Egypt", // Specific object and association
  "/images/articles/brain-removal-diagram.png": "Diagram Egyptian mummification excerebration", // Search for specific process diagram
  "/images/articles/body-covered-in-natron.jpg": "Illustration Egyptian mummification natron drying", // Search for illustrations of the process step
  "/images/articles/raw-natron-sample.jpg": "Natron crystals sample Wadi Natrun", // Specific substance, possibly source location
  "/images/articles/mummy-resin-closeup.jpg": "Mummy bandages resin detail Egypt", // Specific features
  "/images/articles/mummy-wrapping-amulets-diagram.png": "Diagram mummy amulets placement Egypt", // Search for diagrams of amulet placement
  "/images/articles/mummy-intricate-bandaging.jpg": "Mummy intricate linen bandaging Egypt", // Specific feature
  "/images/articles/opening-of-the-mouth-ceremony.jpg": "Opening of the Mouth ceremony painting relief Egypt", // Specific ritual, art type

  // ==================================
  // Article: weighing-of-heart-judgement (egyptian-afterlife-weighing-heart-judgement-hell)
  // ==================================
  "/images/articles/weighing-heart-hunefer-main.jpg": "Papyrus of Hunefer Weighing of the Heart full scene", // Specific papyrus, focus on main scene
  "/images/articles/maat-goddess-feather.jpg": "Goddess Maat ostrich feather relief drawing", // Specific deity, symbol, art type
  "/images/articles/hall-of-two-truths-papyrus.jpg": "Papyrus Hall of Two Truths Osiris assessors", // Specific scene, key figures
  "/images/articles/negative-confession-assessors.jpg": "Papyrus Negative Confession 42 assessor gods", // Specific spell section, key number
  "/images/articles/weighing-heart-anubis-thoth.jpg": "Anubis Thoth Weighing of the Heart papyrus relief", // Key figures, scene, art type
  "/images/articles/field-of-reeds-tomb-painting.jpg": "Tomb painting Field of Reeds Aaru Egypt", // Specific location concept, art type
  "/images/articles/ammit-devourer-closeup.jpg": "Ammit devourer Weighing of the Heart papyrus detail", // Specific deity, scene, focus

  // ==================================
  // Article: sacred-animals-egypt (sacred-animals-egyptian-gods-manifestations)
  // ==================================
  "/images/articles/sacred-animals-collage.jpg": "Egyptian sacred animals collage representation", // Representation focus
  "/images/articles/bastet-cat-statue-bronze.jpg": "Statue Bastet cat bronze Egypt", // Specific deity, form, material
  "/images/articles/cat-mummies-egypt.jpg": "Cat mummies Bubastis Saqqara Egypt", // Specific object, possible locations
  "/images/articles/sobek-temple-relief-kom-ombo.jpg": "Relief Sobek Kom Ombo temple", // Specific deity, location, art type
  "/images/articles/mummified-crocodiles-egypt.jpg": "Mummified crocodile Sobek Kom Ombo", // Specific object, deity, location
  "/images/articles/khepri-scarab-statue-karnak.jpg": "Statue Khepri scarab Karnak Temple", // Specific deity, form, location
  "/images/articles/scarab-amulets-various.jpg": "Scarab amulets faience stone Egypt", // Specific object, materials
  // This single file path likely represents a composite image the user intended. Query reflects the group.
  "/images/articles/sacred-animals-ibis-falcon-cow.jpg": "Egyptian sacred animal representations Ibis Falcon Hathor",
  "/images/articles/animal-mummy-catacombs.jpg": "Animal mummy catacombs Saqqara Tuna el-Gebel", // Specific context, possible locations
  "/images/articles/various-animal-mummies-display.jpg": "Museum display Egyptian animal mummies", // Description of the intended image

  // ==================================
  // Article: greatest-pharaohs-comparison (greatest-egyptian-pharaoh-hatshepsut-ramses-thutmose)
  // ==================================
  "/images/articles/greatest-pharaohs-montage.jpg": "Montage Hatshepsut Thutmose III Ramses II statues", // Reflects content
  "/images/articles/hatshepsut-statue-as-king.jpg": "Statue Hatshepsut pharaoh false beard", // Specific features
  "/images/articles/deir-el-bahri-punt-relief.jpg": "Relief Punt expedition Deir el-Bahri Hatshepsut", // Specific event, location, ruler
  "/images/articles/thutmose-iii-smiting-enemies-relief.jpg": "Relief Thutmose III smiting enemies Karnak", // Specific ruler, action, possible location
  "/images/articles/egyptian-empire-map-thutmose-iii.png": "Map Egyptian Empire New Kingdom Thutmose III", // Specific map type and period
  "/images/articles/ramses-ii-abu-simbel-colossi.jpg": "Colossi Ramses II Abu Simbel Great Temple", // Specific ruler, location, feature
  "/images/articles/battle-of-kadesh-relief-ramses.jpg": "Relief Battle of Kadesh Ramses II chariot", // Specific battle, ruler, feature

  // ==================================
  // Article: tutankhamun-curse-legacy-fact-fiction (tutankhamun-tomb-curse-myth-vs-reality-legacy)
  // ==================================
  "/images/articles/tutankhamun-gold-mask-closeup.jpg": "Tutankhamun gold mask death mask Cairo Museum", // Specific object, possible location
  "/images/articles/carter-carnarvon-tomb-entrance-bw.jpg": "Howard Carter Lord Carnarvon Tutankhamun tomb entrance 1922", // Specific people, event, location, year
  "/images/articles/curse-newspaper-headlines-1920s.jpg": "Newspaper headline Tutankhamun curse 1920s", // Specific content and era
  "/images/articles/lord-carnarvon-photo-portrait.jpg": "Lord Carnarvon portrait photograph", // Specific person
  "/images/articles/tutankhamun-mummy-ct-scan.jpg": "CT Scan Tutankhamun mummy", // Specific technology and subject (may find news articles/diagrams)
  "/images/articles/tutankhamun-restoring-amun-relief.jpg": "Relief Tutankhamun offering Amun Karnak", // Specific ruler, action, deity, possible location
  "/images/articles/tutankhamun-tomb-nested-shrines.jpg": "Tutankhamun tomb golden shrines KV62", // Specific object, location
  "/images/articles/tutankhamun-chariot-tomb.jpg": "Chariot Tutankhamun tomb KV62", // Specific object, location

  // ==================================
  // Article: akhenaten-amarna-revolution (akhenaten-atenism-amarna-period-egypt)
  // ==================================
  "/images/articles/akhenaten-nefertiti-aten-relief.jpg": "Relief Akhenaten Nefertiti daughters Aten Amarna style", // Specific people, subject, style
  "/images/articles/aten-disk-rays-hands.jpg": "Aten sun disk rays hands relief Amarna", // Specific iconography, location context
  "/images/articles/amarna-city-map-reconstruction.png": "Map reconstruction city Akhetaten Amarna", // Specific location, type of image
  "/images/articles/amarna-boundary-stela.jpg": "Boundary stela Akhenaten Amarna", // Specific object, ruler, location
  "/images/articles/nefertiti-bust-berlin.jpg": "Bust of Nefertiti Neues Museum Berlin", // Very specific famous object and location
  "/images/articles/akhenaten-daughters-relief.jpg": "Relief Akhenaten Nefertiti daughters Amarna style", // Specific people, style
  "/images/articles/akhenaten-defaced-cartouche.jpg": "Defaced cartouche Akhenaten damnatio memoriae Egypt", // Specific action, ruler, concept

  // ==================================
  // Article: cleopatra-politician-rome (cleopatra-vii-egypt-rome-politics-biography)
  // ==================================
  "/images/articles/cleopatra-dendera-relief.jpg": "Relief Cleopatra VII Caesarion Dendera Temple", // Specific people, location
  "/images/articles/cleopatra-coin-portrait.jpg": "Coin portrait Cleopatra VII", // Specific ruler, object type
  "/images/articles/ptolemaic-egypt-map.png": "Map Ptolemaic Kingdom Egypt Mediterranean", // Specific historical period/entity
  "/images/articles/cleopatra-caesar-painting-interpretive.jpg": "Painting Cleopatra Julius Caesar meeting", // Subject of painting (acknowledges interpretation)
  "/images/articles/cleopatra-as-isis-stela.jpg": "Relief Cleopatra VII as Isis offering", // Specific ruler, role, action
  "/images/articles/cleopatra-antony-coin.jpg": "Coin Mark Antony Cleopatra VII", // Specific people, object type
  "/images/articles/battle-of-actium-map-diagram.png": "Map diagram Battle of Actium 31 BC", // Specific battle, year
  "/images/articles/death-of-cleopatra-painting-reni.jpg": "Painting Death of Cleopatra Guido Reni", // Specific artwork if known, or "Painting Death of Cleopatra asp"

  // ==================================
  // Article: divine-kingship-egypt (egyptian-pharaoh-divine-kingship-god-king)
  // ==================================
  "/images/articles/pharaoh-horus-protection.jpg": "Statue Khafre Horus falcon protection Cairo Museum", // Specific statue, subject, possible location
  "/images/articles/pharaoh-double-crown-uraeus.jpg": "Pharaoh Pschent double crown Uraeus representation", // Specific regalia, type
  "/images/articles/pharaoh-offering-to-gods-relief.jpg": "Relief pharaoh offering Maat gods Egypt", // General scene, specific concept (Maat)
  "/images/articles/egyptian-royal-regalia-chart.png": "Diagram Egyptian royal crowns sceptres regalia", // Search for diagram/chart
  "/images/articles/temple-ritual-scene-pharaoh.jpg": "Relief temple ritual pharaoh offering god Egypt", // General ritual scene
  "/images/articles/mortuary-temple-medinet-habu.jpg": "Temple Medinet Habu Ramses III West Bank Luxor", // Specific temple, ruler, location

  // ==================================
  // Article: day-in-the-life-egypt (ancient-egypt-daily-life-common-people-society)
  // ==================================
  "/images/articles/egyptian-daily-life-tomb-scene.jpg": "Tomb painting Egyptian daily life Nakht Sennedjem", // General scene, specific tomb examples if known
  "/images/articles/egyptian-farming-plowing-harvesting.jpg": "Tomb painting Egyptian farming plowing harvesting Menna", // Specific actions, example tomb
  "/images/articles/egyptian-craftsmen-workshop-model.jpg": "Model Egyptian workshop bakery brewery Meketre", // Specific object type, context, example tomb
  "/images/articles/egyptian-relief-craftsmen-working.jpg": "Relief Egyptian craftsmen working stone wood", // Specific actions, materials
  "/images/articles/egyptian-seated-scribe-statue.jpg": "Statue Seated Scribe Louvre Cairo Museum", // Specific famous statue, possible locations
  "/images/articles/hieratic-script-ostracon.jpg": "Ostracon hieratic script Deir el-Medina", // Specific object, script, possible location
  "/images/articles/egyptian-noble-villa-reconstruction.jpg": "Reconstruction Egyptian noble villa Amarna", // Type of image, context
  "/images/articles/egyptian-banquet-scene-tomb.jpg": "Tomb painting banquet scene Nebamun Rekhmire", // Specific scene, example tombs
  "/images/articles/egyptian-house-model-drawing.jpg": "Model drawing Egyptian house mudbrick", // Type of image, material
  "/images/articles/egyptian-family-stela.jpg": "Stela Egyptian family group", // Specific object type, subject
  "/images/articles/senet-game-board-ancient-egypt.jpg": "Senet game board artifact Egypt", // Specific object type
  "/images/articles/egyptian-musicians-dancers-relief.jpg": "Relief painting Egyptian musicians dancers", // Subjects, art types

  // ==================================
  // Article: ancient-egyptian-diet-details (ancient-egyptian-diet-food-beer-bread-nutrition)
  // ==================================
  "/images/articles/egyptian-food-offering-table.jpg": "Egyptian offering table food depictions", // Specific object, content
  "/images/articles/egyptian-bakery-brewery-model.jpg": "Model Egyptian bakery brewery", // Specific object type, activities
  "/images/articles/bread-beer-making-relief.jpg": "Relief Egyptian bread beer making", // Specific activities, art type
  "/images/articles/egyptian-vegetable-fruit-offerings-painting.jpg": "Tomb painting Egyptian food offerings vegetables fruit", // Art type, subject matter
  "/images/articles/preserved-dates-egyptian-tomb.jpg": "Preserved dates Egyptian tomb offering", // Specific object, context
  "/images/articles/egyptian-fishing-fowling-marsh-scene.jpg": "Tomb painting Egyptian fishing fowling marshes", // Specific activities, context, art type
  "/images/articles/cattle-herding-egyptian-relief.jpg": "Relief Egyptian cattle herding", // Specific activity, art type
  "/images/articles/egyptian-beekeeping-relief.jpg": "Relief Egyptian beekeeping Rekhmire", // Specific activity, example tomb
  "/images/articles/egyptian-banquet-vs-farmer-meal.jpg": "Tomb painting Egyptian banquet comparison", // Subject comparison (might be difficult)
  "/images/articles/egyptian-tomb-food-offerings.jpg": "Preserved food offerings Egyptian tomb", // Specific objects, context

  // ==================================
  // Article: egyptian-women-rights-roles (ancient-egyptian-women-rights-independence-roles)
  // ==================================
  "/images/articles/egyptian-women-independent-figures.jpg": "Ancient Egyptian women representation art", // General representation
  "/images/articles/egyptian-woman-property-document.jpg": "Papyrus legal document woman property Egypt", // Specific document type, subject
  "/images/articles/stela-woman-offering-agency.jpg": "Stela Egyptian woman offering", // Specific object, action
  "/images/articles/rahotep-nofret-statue-couple.jpg": "Statue Rahotep Nofret Cairo Museum", // Specific famous statue, location
  "/images/articles/egyptian-women-musicians-weavers-painting.jpg": "Tomb painting Egyptian women music weaving", // Subjects, art type
  "/images/articles/priestess-hathor-statue.jpg": "Statue Egyptian priestess Hathor Isis", // Role, possible deities
  // Note: Original map had "/images/articles/royal-women.jpg", which isn't in the MD file provided. Assuming Nefertiti is a good proxy if needed.
  // "/images/articles/nefertiti-bust-profile.jpg": "Bust of Nefertiti profile Neues Museum", // (If this file path was intended instead of royal-women.jpg)
   "/images/articles/gods-wife-of-amun-relief.jpg": "Relief God's Wife of Amun Karnak", // Specific title, possible location
  "/images/articles/egyptian-family-portrait-statue.jpg": "Statue Egyptian family group official wife child", // Specific subject

  // ==================================
  // Article: ancient-egyptian-homes (ancient-egyptian-homes-houses-architecture-daily-life)
  // ==================================
  "/images/articles/egyptian-house-reconstruction-complex.jpg": "Reconstruction Egyptian noble house architecture", // Type of image, subject
  "/images/articles/ancient-egyptian-mudbricks.jpg": "Mudbricks ancient Egypt texture", // Material, context
  "/images/articles/mudbrick-making-reconstruction.jpg": "Reconstruction making mudbricks Egypt", // Activity, context
  "/images/articles/deir-el-medina-workers-house-plan.png": "Plan workers house Deir el-Medina", // Specific location, type
  "/images/articles/egyptian-village-home-reconstruction.jpg": "Reconstruction simple Egyptian village house", // Type of image, subject
  "/images/articles/egyptian-town-house-reconstruction.jpg": "Reconstruction Egyptian town house multi-story", // Type of image, subject
  "/images/articles/amarna-town-foundations.jpg": "Excavation house foundations Amarna", // Specific location, context
  "/images/articles/noble-villa-garden-reconstruction.jpg": "Reconstruction Egyptian noble villa garden pool", // Type of image, subject
  "/images/articles/amarna-palace-painted-wall-fragment.jpg": "Painted wall fragment Amarna palace birds plants", // Specific object, location, details
  "/images/articles/tutankhamun-tomb-furniture.jpg": "Furniture Tutankhamun tomb chairs beds chests", // Specific source, object types
  "/images/articles/windcatcher-malqaf-diagram.png": "Diagram Egyptian windcatcher malqaf architecture", // Specific feature, type of image

  // ==================================
  // Article: ancient-egyptian-leisure-fun (ancient-egyptian-leisure-games-music-festivals-fun)
  // ==================================
  "/images/articles/egyptian-leisure-activities-montage.jpg": "Montage Egyptian leisure games music festivals", // Type of image, subjects
  "/images/articles/senet-game-tutankhamun-tomb.jpg": "Senet board Tutankhamun tomb artifact", // Specific object, source
  "/images/articles/egyptians-playing-senet-tomb-painting.jpg": "Tomb painting Egyptians playing Senet", // Specific activity, art type
  "/images/articles/ancient-egyptian-toys-display.jpg": "Ancient Egyptian children toys wood doll animal", // Specific objects
  "/images/articles/egyptian-musicians-dancers-banquet-painting.jpg": "Tomb painting Egyptian banquet musicians dancers Nebamun", // Specific scene, example tomb
  "/images/articles/ancient-egyptian-harp.jpg": "Ancient Egyptian harp instrument", // Specific object
  "/images/articles/egyptian-banquet-scene-nebamun-detail.jpg": "Tomb painting banquet Nebamun detail British Museum", // Specific artwork, detail, location
  "/images/articles/nebamun-fowling-scene-british-museum.jpg": "Tomb painting Nebamun fowling marshes British Museum", // Specific artwork, location
  "/images/articles/pharaoh-hunting-relief.jpg": "Relief pharaoh hunting chariot desert", // Subject, action, context
  "/images/articles/opet-festival-procession-luxor-relief.jpg": "Relief Opet Festival procession Luxor Temple barques", // Specific event, location, feature

  // ==================================
  // Article: building-great-pyramid (how-great-pyramid-giza-built-engineering-theories)
  // ==================================
  "/images/articles/great-pyramid-giza-sunset.jpg": "Great Pyramid Giza sunset", // Subject, context
  "/images/articles/pyramid-evolution-diagram.png": "Diagram evolution mastaba step pyramid true pyramid", // Type of image, subject
  "/images/articles/step-pyramid-bent-pyramid-photos.jpg": "Step Pyramid Saqqara Bent Pyramid Dahshur comparison", // Specific pyramids, locations
  "/images/articles/aswan-quarry-unfinished-obelisk.jpg": "Unfinished Obelisk Aswan granite quarry", // Specific object, location
  "/images/articles/quarrying-techniques-diagram.png": "Diagram Egyptian stone quarrying techniques wedges", // Type of image, subject
  "/images/articles/statue-moved-on-sledge-relief.jpg": "Relief hauling colossal statue sledge El-Bersheh", // Specific artwork, action, location
  "/images/articles/giza-quarry-transport-map.png": "Map Giza Tura Aswan quarries Nile transport", // Type of image, locations, context
  "/images/articles/pyramid-ramp-theories-diagrams.png": "Diagram pyramid construction ramp theories internal external", // Type of image, subject
  "/images/articles/pyramid-casing-stones-precision.jpg": "Great Pyramid Giza casing stones precision jointing", // Specific feature, location
  "/images/articles/pyramid-alignment-methods-diagram.png": "Diagram pyramid alignment astronomical methods", // Type of image, subject
  "/images/articles/giza-workers-village-excavation.jpg": "Excavation Giza workers village Heit el-Ghurab", // Specific location, context
  "/images/articles/giza-workers-village-reconstruction.jpg": "Reconstruction Giza workers village pyramid builders", // Type of image, subject
  "/images/articles/great-pyramid-internal-cutaway-diagram.png": "Diagram cutaway Great Pyramid Giza internal chambers passages", // Type of image, subject

  // ==================================
  // Article: karnak-temple-complex (karnak-temple-luxor-egypt-amun-ra-hypostyle-hall)
  // ==================================
  "/images/articles/karnak-hypostyle-hall-overview.jpg": "Karnak Temple Great Hypostyle Hall columns overview", // Specific location, feature
  "/images/articles/karnak-temple-complex-aerial-map.jpg": "Aerial view map Karnak Temple complex Luxor", // Type of image, specific location
  "/images/articles/karnak-ram-headed-sphinx-avenue.jpg": "Avenue of ram-headed sphinxes Karnak Temple", // Specific feature, location
  "/images/articles/karnak-first-pylon-entrance.jpg": "First Pylon Karnak Temple entrance", // Specific feature, location
  "/images/articles/karnak-hypostyle-hall-columns-scale.jpg": "Karnak Great Hypostyle Hall columns scale people", // Specific location, feature, emphasizing scale
  "/images/articles/karnak-column-decoration-closeup.jpg": "Karnak Hypostyle Hall column reliefs hieroglyphs detail", // Specific location, feature, detail
  "/images/articles/hatshepsut-obelisk-karnak.jpg": "Obelisk Hatshepsut Karnak Temple standing", // Specific object, ruler, location
  "/images/articles/karnak-sacred-lake.jpg": "Sacred Lake Karnak Temple", // Specific feature, location
  "/images/articles/karnak-inner-sanctuary-area.jpg": "Karnak Temple inner sanctuary view towards holy of holies", // Specific area, perspective
  "/images/articles/barque-shrine-reconstruction-karnak.png": "Reconstruction barque shrine Amun Karnak Temple", // Type of image, subject, location
  "/images/articles/karnak-construction-timeline-graphic.png": "Diagram Karnak Temple construction phases timeline", // Type of image, subject

  // ==================================
  // Article: valley-of-the-kings-tombs (valley-of-the-kings-egypt-royal-tombs-tutankhamun)
  // ==================================
  "/images/articles/valley-of-the-kings-panorama.jpg": "Panorama Valley of the Kings Luxor West Bank", // Type of image, specific location
  "/images/articles/el-qurn-peak-valley-kings.jpg": "El-Qurn peak Theban hills Valley of the Kings", // Specific landmark, location
  "/images/articles/valley-of-kings-queens-map-thebes.png": "Map Theban Necropolis Valley Kings Queens Deir el-Bahri", // Type of image, specific locations
  "/images/articles/seti-i-tomb-layout-cutaway.png": "Diagram tomb layout Seti I KV17 Valley of the Kings", // Type of image, specific tomb
  "/images/articles/ramses-vi-tomb-decorated-walls.jpg": "Tomb of Ramses VI KV9 decorated walls ceiling Nut", // Specific tomb, features
  "/images/articles/deir-el-medina-village-ruins.jpg": "Ruins workers village Deir el-Medina", // Specific location
  "/images/articles/deir-el-medina-workers-tomb-decoration.jpg": "Tomb painting workers Deir el-Medina Sennedjem Pashedu", // Context, specific tomb examples
  "/images/articles/tomb-robbery-forced-doorway-kv.jpg": "Tomb entrance Valley of the Kings robbery damage", // Context, specific location
  "/images/articles/tutankhamun-tomb-entrance-kv62.jpg": "Entrance Tomb of Tutankhamun KV62 Valley of the Kings", // Specific tomb entrance
  "/images/articles/seti-i-tomb-kv17-burial-chamber.jpg": "Burial chamber Tomb of Seti I KV17 decorated walls", // Specific tomb, room, feature

  // ==================================
  // Article: beyond-pyramids-tombs-temples (egyptian-architecture-mastabas-rock-tombs-cult-mortuary-temples)
  // ==================================
  "/images/articles/egyptian-architecture-diversity-collage.jpg": "Collage Egyptian architecture mastaba temple rock tomb", // Type of image, subjects
  "/images/articles/mastaba-field-saqqara.jpg": "Mastaba field Saqqara necropolis", // Specific feature, location
  "/images/articles/mastaba-cutaway-diagram.png": "Diagram mastaba structure chapel burial shaft", // Type of image, subject
  "/images/articles/beni-hasan-rock-cut-tomb-entrances.jpg": "Rock-cut tomb entrances Beni Hasan Middle Kingdom", // Specific feature, location, period
  "/images/articles/valley-of-the-kings-tomb-entrances.jpg": "Tomb entrances Valley of the Kings rock-cut", // Specific feature, location
  "/images/articles/edfu-temple-pylon-court.jpg": "Temple of Edfu pylon courtyard Horus", // Specific temple, features, deity
  "/images/articles/cult-temple-layout-plan.png": "Diagram Egyptian cult temple layout plan", // Type of image, subject
  "/images/articles/hatshepsut-temple-deir-el-bahri-view.jpg": "Temple of Hatshepsut Deir el-Bahri terraced", // Specific temple, location, feature
  "/images/articles/medinet-habu-reliefs-ramses-iii.jpg": "Reliefs Medinet Habu Temple Ramses III battles", // Specific location, ruler, subject
  "/images/articles/sun-temple-abu-ghurab-reconstruction.jpg": "Reconstruction Sun Temple Niuserre Abu Ghurab obelisk", // Type of image, specific temple, feature
  "/images/articles/egyptian-column-types-composite.jpg": "Egyptian columns papyrus lotus palmiform composite", // Specific architectural features

  // ==================================
  // Article: egyptian-obelisks-engineering (ancient-egyptian-obelisks-engineering-quarrying-erecting)
  // ==================================
  "/images/articles/karnak-obelisks-pair.jpg": "Obelisks Karnak Temple Thutmose I Hatshepsut", // Specific location, objects, possible rulers
  "/images/articles/obelisk-diagram-parts.png": "Diagram obelisk shape shaft pyramidion", // Type of image, subject
  "/images/articles/obelisk-pyramidion-closeup.jpg": "Obelisk pyramidion top closeup granite sky", // Specific part, detail
  "/images/articles/unfinished-obelisk-aswan-quarry.jpg": "Unfinished Obelisk Aswan granite quarry Egypt", // Specific object, location
  "/images/articles/obelisk-erection-methods-diagram.png": "Diagram obelisk erection ancient Egypt ramp lever", // Type of image, subject
  "/images/articles/luxor-temple-obelisk-pair-entrance.jpg": "Obelisk Luxor Temple entrance pylon Ramses II", // Specific location, feature, ruler
  "/images/articles/hatshepsut-obelisk-standing-karnak.jpg": "Standing obelisk Hatshepsut Karnak", // Specific object, ruler, location
  "/images/articles/lateran-obelisk-rome.jpg": "Lateran Obelisk Rome Piazza San Giovanni", // Specific object, location
  "/images/articles/obelisk-hieroglyphs-closeup.jpg": "Obelisk hieroglyphs granite closeup detail", // Specific feature, material, detail

  // ==================================
  // Article: egyptian-hieroglyphs-guide (egyptian-hieroglyphs-explained-reading-guide-basics)
  // ==================================
  "/images/articles/hieroglyphs-painted-tomb-wall.jpg": "Painted hieroglyphs tomb wall Egypt detail", // Specific context, feature, detail
  "/images/articles/hieroglyph-sign-types-example.png": "Diagram hieroglyph types phonogram logogram determinative", // Type of image, subject
  "/images/articles/egyptian-hieroglyph-alphabet-chart.png": "Chart Egyptian hieroglyph alphabet uniliteral signs", // Type of image, specific content
  "/images/articles/hieroglyph-logograms-examples.png": "Examples Egyptian hieroglyph logograms ideograms", // Subject
  "/images/articles/hieroglyph-determinative-example.png": "Example hieroglyph determinative usage meaning", // Subject
  "/images/articles/hieroglyph-reading-direction-arrows.png": "Diagram hieroglyph reading direction examples", // Type of image, subject
  "/images/articles/tutankhamun-cartouche-example.jpg": "Cartouche Tutankhamun hieroglyphs KV62", // Specific feature, ruler, possible location
  "/images/articles/hieroglyphic-hieratic-demotic-comparison.png": "Comparison Hieroglyphic Hieratic Demotic scripts", // Specific subject
  "/images/articles/rosetta-stone-british-museum.jpg": "Rosetta Stone British Museum decree Ptolemy V", // Specific object, location, content hint

  // ==================================
  // Article: egyptian-art-perspective-symbolism (egyptian-art-perspective-symbolism-conventions-meaning)
  // ==================================
  "/images/articles/egyptian-art-tomb-painting-stylized.jpg": "Egyptian tomb painting figures stylized profile convention", // Art type, style, feature
  "/images/articles/egyptian-art-composite-perspective-diagram.png": "Diagram Egyptian art composite perspective aspectivity", // Type of image, concept
  "/images/articles/pharaoh-smiting-enemies-hierarchical-scale.jpg": "Relief Narmer Palette hierarchical scale smiting", // Example artwork, concept, action
  "/images/articles/egyptian-tomb-painting-registers.jpg": "Tomb painting registers narrative bands Egypt", // Art type, feature, concept
  "/images/articles/egyptian-art-symbolic-colors-relief.jpg": "Painted relief symbolic colors Egyptian art", // Feature, concept, art type
  "/images/articles/egyptian-art-style-comparison-amarna.jpg": "Comparison Egyptian art formal style Amarna style", // Concept, specific period

  // ==================================
  // Article: ancient-egyptian-technology-innovations (ancient-egyptian-technology-innovations-medicine-math-engineering)
  // ==================================
  "/images/articles/egyptian-technology-montage.jpg": "Montage Egyptian technology medicine engineering papyrus", // Type of image, subjects
  "/images/articles/edwin-smith-papyrus-page.jpg": "Edwin Smith Papyrus medical text surgery", // Specific papyrus, subject
  "/images/articles/ancient-egyptian-surgical-tools.jpg": "Ancient Egyptian surgical instruments bronze", // Specific objects, material
  "/images/articles/rhind-mathematical-papyrus-section.jpg": "Rhind Mathematical Papyrus fractions geometry", // Specific papyrus, subjects
  "/images/articles/egyptian-units-measurement-diagram.png": "Diagram Egyptian measurement units cubit deben", // Type of image, specific units
  "/images/articles/shaduf-irrigation-egypt-relief.jpg": "Relief painting shaduf irrigation Egypt", // Specific device, activity, art type
  "/images/articles/ancient-egyptian-canal-system-map.png": "Map ancient Egyptian irrigation canals Nile", // Type of image, subject
  "/images/articles/egyptian-core-formed-glass-vessels.jpg": "Ancient Egyptian core-formed glass vessels amphoriskos", // Specific technique, object type
  "/images/articles/egyptian-faience-amulets-tiles.jpg": "Egyptian faience blue green amulets shabti tiles", // Specific material, color, object types
  // Removed water clock reconstruction query as duplicate path used below for tools
  // "/images/articles/egyptian-water-clock-clepsydra.jpg": "Reconstruction Egyptian water clock clepsydra", // Specific object, type of image
  "/images/articles/egyptian-civil-calendar-diagram.png": "Diagram Egyptian civil calendar 365 days seasons", // Type of image, subject
  "/images/articles/papyrus-plants-nile.jpg": "Papyrus plants Cyperus papyrus Nile delta marsh", // Specific plant, scientific name, location context
  "/images/articles/writing-on-papyrus-closeup.jpg": "Closeup hieratic demotic script papyrus", // Specific scripts, material, view

  // ==================================
  // Article: egyptian-writing-materials (ancient-egyptian-writing-materials-papyrus-ostraca-stone)
  // ==================================
  "/images/articles/egyptian-scribal-palette-papyrus.jpg": "Egyptian scribal palette reed pens papyrus", // Specific objects
  "/images/articles/papyrus-making-process-diagram.png": "Diagram papyrus making process Egypt", // Type of image, subject
  "/images/articles/papyrus-scroll-unrolled.jpg": "Papyrus scroll unrolled Book of the Dead", // Specific object, example content
  "/images/articles/ostraca-limestone-pottery-examples.jpg": "Ostraca examples limestone pottery hieratic demotic Egypt", // Specific object, materials, scripts
  "/images/articles/ostracon-sketch-figure.jpg": "Ostracon sketch figure Deir el-Medina", // Specific object, content, possible location
  "/images/articles/hieroglyphs-carved-temple-wall.jpg": "Hieroglyphs carved stone temple wall texture", // Context, feature, material
  "/images/articles/egyptian-stela-inscription.jpg": "Egyptian stela stone inscription hieroglyphs relief", // Specific object, features
  "/images/articles/egyptian-writing-board-gesso.jpg": "Egyptian wooden writing board gesso", // Specific object, material
  "/images/articles/egyptian-mummy-label-wood.jpg": "Egyptian mummy label wood hieratic demotic", // Specific object, material, scripts
  "/images/articles/egyptian-leather-scroll-fragment.jpg": "Fragment Egyptian leather scroll text", // Specific material, object type
  "/images/articles/egyptian-scribal-palette-reed-pens.jpg": "Egyptian scribal palette ink wells reed pens", // Specific objects

  // ==================================
  // Article: egyptian-beauty-adornment (ancient-egyptian-beauty-jewelry-kohl-perfume-symbolism)
  // ==================================
  "/images/articles/egyptian-jewelry-broad-collar.jpg": "Egyptian broad collar wesekh necklace faience gold", // Specific jewelry type, materials
  "/images/articles/tutankhamun-pectoral-jewelry.jpg": "Pectoral Tutankhamun tomb jewelry vulture scarab", // Specific object, source, motifs
  "/images/articles/egyptian-amulet-types-scarab-ankh-wadjet.jpg": "Egyptian amulets scarab ankh djed wadjet eye faience", // Specific types, material
  "/images/articles/ancient-egyptian-kohl-tubes-applicators.jpg": "Ancient Egyptian kohl tubes applicators various materials", // Specific objects
  "/images/articles/egyptian-relief-figure-kohl-eyeliner.jpg": "Egyptian figure kohl eyeliner relief painting", // Specific feature, art types
  "/images/articles/egyptian-alabaster-unguent-jars.jpg": "Egyptian alabaster unguent perfume jars", // Specific material, object type, purpose
  "/images/articles/egyptian-banquet-scene-scent-cones.jpg": "Egyptian banquet painting scent cones wigs", // Specific scene, feature
  "/images/articles/ancient-egyptian-wig-preserved.jpg": "Ancient Egyptian wig human hair artifact", // Specific object, material
  "/images/articles/egyptian-wig-styles-relief.jpg": "Relief painting Egyptian wig styles", // Specific feature, art types
  "/images/articles/egyptian-clothing-statues-reliefs.jpg": "Egyptian clothing linen sheath dress kilt representation", // Specific garments, material, type

};
const queryFilePromptMap = [
  // ==================================
  // Article: gods-family-tree (egyptian-gods-family-tree-pantheon)
  // ==================================
  {
    "filename": "/images/articles/egyptian-pantheon-overview.jpg",
    "prompt": "Create a vibrant, detailed illustration in the distinct style of ancient Egyptian papyrus art. Depict a swirling, dark, primordial watery chaos (Nun) from which numerous small, diverse, stylized god-like figures (representing the Egyptian Pantheon) are emerging. Slightly larger and central, show Atum beginning creation. Use authentic papyrus texture and color palette. Aspect ratio 16:9.",
    "alt_text": "Stylized papyrus illustration showing the vast Egyptian pantheon emerging from primordial chaos (Nun)."
  },
  {
    "filename": "/images/articles/creation-myth-papyrus.jpg",
    "prompt": "Generate an image in the clear style of ancient Egyptian papyrus illustration. Show the god Atum-Ra (with Double Crown) standing on a primordial mound emerging from dark watery chaos (Nun). Show him generating the figures of Shu (god of air) and Tefnut (goddess of moisture) beside him. Use vibrant traditional Egyptian colors and clear hieroglyphic-style profile figures. Aspect ratio 4:3.",
    "alt_text": "Ancient Egyptian papyrus style illustration of Atum-Ra creating Shu and Tefnut from the primordial mound in Nun."
  },
  {
    "filename": "/images/articles/ennead-family-tree-diagram.png",
    "prompt": "Design a clear, elegant, minimalist diagram in an ancient Egyptian schematic style. Illustrate the Ennead family tree: Atum at the top, branching to Shu & Tefnut, then Geb & Nut, then Osiris, Isis, Set, Nephthys. Use simple profile figures or hieroglyphs, connecting lines, and clear labels for each god. Neutral papyrus or light stone background. Aspect ratio 1:1.",
    "alt_text": "Diagram illustrating the family tree relationships of the nine Egyptian gods of the Great Ennead."
  },
  {
    "filename": "/images/articles/amun-ra-statue-karnak.jpg",
    "prompt": "Generate a realistic photograph of a majestic, weathered stone statue of the Egyptian god Amun-Ra standing within the Karnak Temple complex. The statue should wear the tall double-plumed crown. Capture the scale and grandeur with temple columns or structures visible in the background. Sunlight casting dramatic shadows. Aspect ratio 3:4.",
    "alt_text": "Majestic stone statue of the Egyptian god Amun-Ra with double-plumed crown at Karnak Temple."
  },
  {
    "filename": "/images/articles/ra-solar-barque-relief.jpg",
    "prompt": "Create an image in the style of a well-preserved ancient Egyptian limestone relief carving. Depict the falcon-headed sun god Ra, crowned with a sun disk, sailing through the sky or underworld in his detailed solar barque, accompanied by other deities. Clear hieroglyphic style figures and boat details. Aspect ratio 16:9.",
    "alt_text": "Ancient Egyptian relief carving showing the sun god Ra sailing in his solar barque."
  },
  {
    "filename": "/images/articles/bes-taweret-amulets.jpg",
    "prompt": "Generate a realistic photo display of ancient Egyptian artifacts. Show two distinct amulets side-by-side on a neutral background (sand or linen). One amulet of the dwarf god Bes (grotesque features, feather crown). The other of goddess Taweret (composite pregnant hippopotamus). Both made of classic blue-green Egyptian faience. Clear details and lighting. Aspect ratio 16:9.",
    "alt_text": "Realistic photo of ancient Egyptian faience amulets depicting protective deities Bes and Taweret."
  },
  {
    "filename": "/images/articles/thoth-statue-scribe.jpg",
    "prompt": "Generate a high-quality photograph of an ancient Egyptian statue depicting the god Thoth in his ibis-headed form. Show him standing or seated, perhaps holding a scribal palette or papyrus scroll, symbolizing wisdom and writing. Material could be stone (granite, diorite) or bronze. Museum lighting. Aspect ratio 3:4.",
    "alt_text": "Ancient Egyptian statue of the ibis-headed god Thoth, associated with wisdom and scribes."
  },
  {
    "filename": "/images/articles/isis-mourning-osiris-relief.jpg",
    "prompt": "Create a dramatic scene in the style of an ancient Egyptian painted relief carving. Show the goddess Isis, kneeling with elegant wings outstretched protectively over the mummified body of Osiris lying on a funerary bier. Nephthys kneels at his feet, mourning. Use traditional Egyptian profile views and symbolic colors. Aspect ratio 16:9.",
    "alt_text": "Ancient Egyptian relief depicting Isis with protective wings mourning over the mummy of Osiris."
  },

  // ==================================
  // Article: book-of-dead-guide (egyptian-book-of-the-dead-afterlife-guide)
  // ==================================
  {
    "filename": "/images/articles/book-of-dead-papyrus-hunefer.jpg",
    "prompt": "Generate a high-resolution image accurately depicting the 'Weighing of the Heart' scene from the Papyrus of Hunefer, Book of the Dead. Show Anubis leading Hunefer, the scales with heart and feather, Ammit waiting, Thoth recording, and Osiris presiding. Maintain the distinct artistic style and colors of the original papyrus. Capture full scene width.",
    "alt_text": "The Weighing of the Heart ceremony depicted on the ancient Egyptian Papyrus of Hunefer."
  },
  {
    "filename": "/images/articles/book-of-dead-scroll-display.jpg",
    "prompt": "Generate a photograph of an ancient Egyptian Book of the Dead papyrus scroll partially unrolled and displayed flat, perhaps in a museum setting under glass. Show intricate hieroglyphic text and colorful vignettes (illustrations). Focus on the texture of the papyrus and the visual richness. Aspect ratio 16:9.",
    "alt_text": "An ancient Egyptian Book of the Dead papyrus scroll displayed, showing text and illustrations."
  },
  {
    "filename": "/images/articles/weighing-of-the-heart-detail.jpg",
    "prompt": "Create a detailed close-up view of the central element of the 'Weighing of the Heart' scene from an ancient Egyptian Book of the Dead papyrus. Focus specifically on the scales, showing the heart on one side and the feather of Ma'at on the other, with Anubis adjusting the balance. High detail, papyrus texture. Aspect ratio 4:3.",
    "alt_text": "Detailed close-up of the scales from the Weighing of the Heart scene in the Egyptian Book of the Dead."
  },
  {
    "filename": "/images/articles/duat-journey-map-diagram.png",
    "prompt": "Create a conceptual diagram or map inspired by ancient Egyptian funerary texts (like the Amduat or Book of Gates). Illustrate the stages or regions of the Duat (underworld) journey, showing the solar barque navigating obstacles, gates, and encountering various deities and demons. Style should be schematic, clear, and evoke Egyptian motifs. Aspect ratio 16:9.",
    "alt_text": "Diagram illustrating the perilous journey through the ancient Egyptian underworld (Duat)."
  },
  {
    "filename": "/images/articles/book-of-dead-quality-comparison.jpg",
    "prompt": "Generate a comparison image showing two vignettes (illustrations) side-by-side from different ancient Egyptian Book of the Dead papyri. One vignette should be highly detailed and colorful (representing high quality), the other simpler or cruder (representing lower quality). Both depicting a similar scene (e.g., offering scene, deceased before Osiris). Aspect ratio 16:9.",
    "alt_text": "Comparison of high-quality vs. lower-quality vignettes from different Book of the Dead papyri."
  },
  {
    "filename": "/images/articles/book-of-dead-vignette-closeup.jpg",
    "prompt": "Generate a close-up photograph or high-resolution scan detail of a particularly vibrant and well-preserved vignette (illustration) from an ancient Egyptian Book of the Dead papyrus. Focus on the artistry, colors, and details of the figures and hieroglyphs within the illustration. Papyrus texture visible. Aspect ratio 4:3.",
    "alt_text": "Detailed close-up of a colorful vignette illustration from an Egyptian Book of the Dead papyrus."
  },

  // ==================================
  // Article: mummification-process-detailed (ancient-egyptian-mummification-process-70-days)
  // ==================================
  {
    "filename": "/images/articles/mummification-anubis-scene.jpg",
    "prompt": "Create an image in the style of an ancient Egyptian tomb painting or relief. Depict the jackal-headed god Anubis tending to a mummy lying on a funerary bier, performing rites associated with mummification or the Opening of the Mouth ceremony. Use traditional Egyptian artistic conventions. Aspect ratio 16:9.",
    "alt_text": "Egyptian tomb art style depicting the god Anubis tending to a mummy on a funerary bier."
  },
  {
    "filename": "/images/articles/ka-ba-akh-diagram.png",
    "prompt": "Create a clear, explanatory diagram illustrating the ancient Egyptian concepts of the soul: the Ka (life force double), the Ba (personality, bird form), and the Akh (transfigured spirit). Use simple symbols or figures connected to a human figure or mummy to show their relationship. Egyptian aesthetic motifs optional. Aspect ratio 1:1 or 4:3.",
    "alt_text": "Diagram explaining the ancient Egyptian soul components: Ka, Ba, and Akh."
  },
  {
    "filename": "/images/articles/embalmers-workshop-reconstruction.jpg",
    "prompt": "Generate a realistic historical reconstruction illustration of an ancient Egyptian embalmer's workshop ('wabet'). Show embalmers working on a body, with tools, linen wrappings, jars (canopic and unguent), and natron visible. Setting should be clean but functional, perhaps near the Nile or desert edge. Aspect ratio 16:9.",
    "alt_text": "Realistic reconstruction of an ancient Egyptian embalmer's workshop during the mummification process."
  },
  {
    "filename": "/images/articles/canopic-jars-set.jpg",
    "prompt": "Generate a high-quality photograph of a complete set of four ancient Egyptian canopic jars, traditionally made of alabaster or limestone. Each jar should have its distinct lid representing one of the Four Sons of Horus (human, baboon, jackal, falcon). Museum quality lighting and display. Aspect ratio 4:3.",
    "alt_text": "A set of four ancient Egyptian canopic jars with lids representing the Four Sons of Horus."
  },
  {
    "filename": "/images/articles/brain-removal-diagram.png",
    "prompt": "Create a respectful, schematic diagram illustrating the ancient Egyptian technique of excerebration (brain removal) during mummification. Show a profile view of a head with a long metal hook inserted through the nostril towards the cranial cavity. Avoid excessive gore, focus on the technical process. Aspect ratio 1:1.",
    "alt_text": "Diagram illustrating the excerebration (brain removal) technique used in Egyptian mummification."
  },
  {
    "filename": "/images/articles/body-covered-in-natron.jpg",
    "prompt": "Generate an illustration depicting a key stage of Egyptian mummification: a human body respectfully covered in a mound of granular natron salt for desiccation, likely on a sloped embalming table. Style can be slightly stylized reconstruction or illustrative. Aspect ratio 16:9.",
    "alt_text": "Illustration showing a body covered in natron salt for drying during Egyptian mummification."
  },
  {
    "filename": "/images/articles/raw-natron-sample.jpg",
    "prompt": "Generate a realistic photograph showing a sample of raw natron crystals or chunks, the natural salt mixture used by ancient Egyptians for drying bodies. Displayed perhaps in a simple bowl or on a textured surface. Aspect ratio 4:3.",
    "alt_text": "Photograph of raw natron crystals, the salt used in ancient Egyptian mummification."
  },
  {
    "filename": "/images/articles/mummy-resin-closeup.jpg",
    "prompt": "Generate a detailed close-up photograph of ancient Egyptian mummy bandages showing visible traces of dark, solidified resin used during the wrapping process. Focus on the texture of the linen and the resin. Aspect ratio 4:3.",
    "alt_text": "Close-up detail of ancient mummy bandages showing dark resin used in wrapping."
  },
  {
    "filename": "/images/articles/mummy-wrapping-amulets-diagram.png",
    "prompt": "Create a diagram illustrating the placement of various protective amulets (e.g., scarab, djed pillar, ankh, Eye of Horus) within the layers of mummy wrappings on a schematic human figure. Use clear outlines and labels for different amulet types. Aspect ratio 1:1 or 3:4.",
    "alt_text": "Diagram showing the placement of protective amulets within Egyptian mummy wrappings."
  },
  {
    "filename": "/images/articles/mummy-intricate-bandaging.jpg",
    "prompt": "Generate a photograph focusing on the head and torso of an ancient Egyptian mummy, showcasing the highly intricate and patterned linen bandaging techniques used, particularly during later periods. Highlight the skill of the wrappers. Aspect ratio 3:4.",
    "alt_text": "Photograph showing the intricate and patterned linen bandaging on an ancient Egyptian mummy."
  },
  {
    "filename": "/images/articles/opening-of-the-mouth-ceremony.jpg",
    "prompt": "Create an image in the style of an ancient Egyptian tomb painting or papyrus illustration depicting the 'Opening of the Mouth' ceremony. Show priests in ritual attire touching the mouth and eyes of a mummy or statue with ritual instruments (like an adze) to restore its senses for the afterlife. Aspect ratio 16:9.",
    "alt_text": "Egyptian art style depiction of the Opening of the Mouth ceremony performed on a mummy."
  },

  // ==================================
  // Article: weighing-of-heart-judgement (egyptian-afterlife-weighing-heart-judgement-hell)
  // ==================================
  {
    "filename": "/images/articles/weighing-heart-hunefer-main.jpg",
    "prompt": "Generate a high-resolution image accurately depicting the full 'Weighing of the Heart' scene from the Papyrus of Hunefer, Book of the Dead. Ensure all key figures are visible: Anubis, Hunefer, scales, Ammit, Thoth, Osiris, Isis, Nephthys, and the 42 assessor gods if possible within composition. Maintain original style. Aspect ratio wide, like 21:9 or 16:9.",
    "alt_text": "The full Weighing of the Heart ceremony including key deities, from the Papyrus of Hunefer."
  },
  {
    "filename": "/images/articles/maat-goddess-feather.jpg",
    "prompt": "Create an image in the style of an ancient Egyptian relief carving or line drawing. Depict the goddess Ma'at, identifiable by the single ostrich feather she wears on her head, seated or standing gracefully. Emphasize the feather as the symbol of truth and justice. Aspect ratio 3:4.",
    "alt_text": "Egyptian representation of the goddess Ma'at wearing her characteristic ostrich feather of truth."
  },
  {
    "filename": "/images/articles/hall-of-two-truths-papyrus.jpg",
    "prompt": "Generate an image inspired by Book of the Dead papyri, depicting the 'Hall of Two Truths' (or Hall of Ma'at). Show the deceased standing before the enthroned god Osiris, ruler of the underworld, often accompanied by Isis and Nephthys. Include the 42 assessor gods arrayed nearby. Papyrus illustration style. Aspect ratio 16:9.",
    "alt_text": "Papyrus illustration depicting the Hall of Two Truths with Osiris presiding over judgement."
  },
  {
    "filename": "/images/articles/negative-confession-assessors.jpg",
    "prompt": "Generate an image focusing on a section of an Egyptian Book of the Dead papyrus that illustrates the 'Negative Confession'. Show the deceased addressing the 42 assessor gods, often depicted as seated figures, sometimes with knives or symbols of judgment. Hieroglyphic text nearby. Aspect ratio 16:9.",
    "alt_text": "Detail from Book of the Dead papyrus showing the 42 assessor gods related to the Negative Confession."
  },
  {
    "filename": "/images/articles/weighing-heart-anubis-thoth.jpg",
    "prompt": "Create a detailed image, either papyrus or relief style, focusing on the roles of Anubis and Thoth during the Weighing of the Heart. Show Anubis adjusting the scales or leading the deceased, while ibis-headed or baboon Thoth stands ready with his scribal palette to record the result. Aspect ratio 4:3.",
    "alt_text": "Egyptian art depicting Anubis and Thoth performing their roles in the Weighing of the Heart ceremony."
  },
  {
    "filename": "/images/articles/field-of-reeds-tomb-painting.jpg",
    "prompt": "Create an image in the vibrant style of an ancient Egyptian tomb painting depicting the Field of Reeds (Aaru), the Egyptian afterlife paradise. Show the deceased enjoying idealized agricultural activities: plowing, sowing, harvesting abundant crops near pleasant waterways under a blue sky. Aspect ratio 16:9.",
    "alt_text": "Egyptian tomb painting depicting the blissful afterlife paradise, the Field of Reeds (Aaru)."
  },
  {
    "filename": "/images/articles/ammit-devourer-closeup.jpg",
    "prompt": "Generate a close-up image focusing on the terrifying figure of Ammit, the 'Devourer of the Dead', as depicted in the Weighing of the Heart scene from an Egyptian papyrus. Clearly show her composite form (crocodile head, lion forequarters, hippopotamus hindquarters) waiting eagerly beside the scales. Papyrus style. Aspect ratio 4:3.",
    "alt_text": "Close-up detail of the demon Ammit, Devourer of the Dead, from the Weighing of the Heart scene."
  },

  // ==================================
  // Article: sacred-animals-egypt (sacred-animals-egyptian-gods-manifestations)
  // ==================================
  {
    "filename": "/images/articles/sacred-animals-collage.jpg",
    "prompt": "Create a visually appealing collage featuring stylized representations of several important ancient Egyptian sacred animals (cat, crocodile, scarab beetle, ibis, falcon, cow, jackal) associated with their respective deities. Arrange harmoniously, perhaps with subtle Egyptian background motifs. Aspect ratio 16:9.",
    "alt_text": "Collage representing various sacred animals worshipped or revered in ancient Egypt."
  },
  {
    "filename": "/images/articles/bastet-cat-statue-bronze.jpg",
    "prompt": "Generate a photograph of a well-preserved ancient Egyptian bronze statue of a seated cat, representing the goddess Bastet. The cat should look alert and elegant. Museum quality lighting, perhaps with a slightly blurred neutral background. Aspect ratio 3:4.",
    "alt_text": "Ancient Egyptian bronze statue of a cat representing the goddess Bastet."
  },
  {
    "filename": "/images/articles/cat-mummies-egypt.jpg",
    "prompt": "Generate a photograph showing several ancient Egyptian cat mummies, carefully wrapped in linen bandages, perhaps displayed in a museum case or as found in catacombs like Bubastis or Saqqara. Aspect ratio 16:9.",
    "alt_text": "Photograph of ancient Egyptian cat mummies discovered in sacred animal necropolises."
  },
  {
    "filename": "/images/articles/sobek-temple-relief-kom-ombo.jpg",
    "prompt": "Create an image showing a detailed relief carving from the Temple of Kom Ombo, depicting the crocodile-headed god Sobek receiving offerings or interacting with a pharaoh. Capture the texture of the stone and the style of Ptolemaic-era temple reliefs. Aspect ratio 4:3.",
    "alt_text": "Relief carving depicting the crocodile god Sobek from the Temple of Kom Ombo."
  },
  {
    "filename": "/images/articles/mummified-crocodiles-egypt.jpg",
    "prompt": "Generate a photograph of several ancient Egyptian mummified crocodiles of various sizes, likely found at a cult center like Kom Ombo or in the Faiyum. Show the texture of the mummified skin or wrappings. Museum display context. Aspect ratio 16:9.",
    "alt_text": "Photograph of ancient Egyptian mummified crocodiles, sacred to the god Sobek."
  },
  {
    "filename": "/images/articles/khepri-scarab-statue-karnak.jpg",
    "prompt": "Generate a photograph of the large granite statue of the scarab beetle Khepri located near the Sacred Lake at Karnak Temple. Show the scale of the statue, possibly with tourists nearby (optional, keep focus on statue). Aspect ratio 4:3 or 16:9.",
    "alt_text": "Large stone statue of the scarab beetle god Khepri at Karnak Temple."
  },
  {
    "filename": "/images/articles/scarab-amulets-various.jpg",
    "prompt": "Generate a photograph displaying a variety of ancient Egyptian scarab amulets. Show different sizes, materials (blue/green faience, steatite, semi-precious stones), and details (inscriptions on base, beetle form). Arranged attractively on a neutral surface. Aspect ratio 16:9.",
    "alt_text": "Collection of various ancient Egyptian scarab amulets made from different materials."
  },
  {
    "filename": "/images/articles/sacred-animals-ibis-falcon-cow.jpg",
    "prompt": "Create a composite image or stylized illustration featuring three distinct sacred animal representations from ancient Egypt: an Ibis (representing Thoth), a Falcon (representing Horus/Ra), and a Cow or cow-headed figure (representing Hathor). Maintain a consistent Egyptian art style. Aspect ratio 16:9.",
    "alt_text": "Representations of sacred Egyptian animals: Ibis (Thoth), Falcon (Horus/Ra), and Cow (Hathor)."
  },
  {
    "filename": "/images/articles/animal-mummy-catacombs.jpg",
    "prompt": "Generate an atmospheric photograph depicting rows or piles of animal mummies (e.g., ibis, falcons, cats) within the dark, underground setting of an ancient Egyptian animal catacomb, such as those found at Saqqara or Tuna el-Gebel. Dim, focused lighting. Aspect ratio 16:9.",
    "alt_text": "Atmospheric view inside an ancient Egyptian catacomb filled with animal mummies."
  },
  {
    "filename": "/images/articles/various-animal-mummies-display.jpg",
    "prompt": "Generate a clear photograph of a museum display showcasing a variety of different ancient Egyptian animal mummies. Include examples like birds (ibis, falcon), mammals (cat, dog, baboon), reptiles (crocodile, snake), and possibly fish, neatly arranged and labelled. Aspect ratio 16:9.",
    "alt_text": "Museum display showing a diverse collection of ancient Egyptian animal mummies."
  },

  // ==================================
  // Article: greatest-pharaohs-comparison (greatest-egyptian-pharaoh-hatshepsut-ramses-thutmose)
  // ==================================
  {
    "filename": "/images/articles/greatest-pharaohs-montage.jpg",
    "prompt": "Create a dynamic montage image featuring iconic representations of three great pharaohs: a powerful statue of Hatshepsut (perhaps as king), a relief of Thutmose III smiting enemies, and a colossal statue head of Ramses II. Blend elements smoothly with Egyptian motifs in the background. Aspect ratio 16:9.",
    "alt_text": "Montage comparing iconic images of pharaohs Hatshepsut, Thutmose III, and Ramses II."
  },
  {
    "filename": "/images/articles/hatshepsut-statue-as-king.jpg",
    "prompt": "Generate a photograph of a well-preserved statue of Pharaoh Hatshepsut depicted in the traditional male pharaonic pose, wearing the kilt, nemes headdress, and possibly the false beard. Focus on the blend of female features with male royal iconography. Stone material (granite, limestone). Museum setting. Aspect ratio 3:4.",
    "alt_text": "Statue of Pharaoh Hatshepsut depicted with male royal regalia, including the false beard."
  },
  {
    "filename": "/images/articles/deir-el-bahri-punt-relief.jpg",
    "prompt": "Create an image focusing on a detailed section of the relief carvings from Hatshepsut's temple at Deir el-Bahri depicting the famous expedition to the Land of Punt. Show ships being loaded with exotic goods like incense trees, animals (monkeys, giraffes), and people from Punt. Limestone relief style. Aspect ratio 16:9.",
    "alt_text": "Relief carving detail from Deir el-Bahri showing Hatshepsut's expedition to Punt."
  },
  {
    "filename": "/images/articles/thutmose-iii-smiting-enemies-relief.jpg",
    "prompt": "Generate an image in the style of a powerful ancient Egyptian temple relief (like at Karnak). Depict Pharaoh Thutmose III in the classic 'smiting pose', holding a group of foreign enemies by the hair and raising a mace to strike them, symbolizing his military dominance. Clear, dynamic relief carving style. Aspect ratio 4:3.",
    "alt_text": "Temple relief carving showing Pharaoh Thutmose III smiting Egypt's enemies."
  },
  {
    "filename": "/images/articles/egyptian-empire-map-thutmose-iii.png",
    "prompt": "Create a clear historical map showing the extent of the ancient Egyptian Empire during the New Kingdom, specifically highlighting the vast territories conquered or influenced under the reign of Thutmose III. Use clear labels and boundaries on a geographical map of the Near East and Northeast Africa. Aspect ratio 16:9.",
    "alt_text": "Map showing the maximum extent of the Egyptian Empire under Pharaoh Thutmose III."
  },
  {
    "filename": "/images/articles/ramses-ii-abu-simbel-colossi.jpg",
    "prompt": "Generate a stunning photograph of the four colossal seated statues of Ramses II flanking the entrance to the Great Temple at Abu Simbel. Capture the immense scale, preferably with a person visible nearby for comparison, under the bright Egyptian sun. Aspect ratio 16:9.",
    "alt_text": "The four colossal statues of Ramses II at the entrance to the Great Temple of Abu Simbel."
  },
  {
    "filename": "/images/articles/battle-of-kadesh-relief-ramses.jpg",
    "prompt": "Generate an image depicting a dynamic section of the relief carvings showing the Battle of Kadesh, famously commissioned by Ramses II (e.g., at Abu Simbel, Karnak, or Ramesseum). Focus on Ramses II in his chariot charging into the Hittite enemies. Detailed relief style. Aspect ratio 16:9.",
    "alt_text": "Relief carving detail depicting Ramses II in his chariot at the Battle of Kadesh."
  },

  // ==================================
  // Article: tutankhamun-curse-legacy-fact-fiction (tutankhamun-tomb-curse-myth-vs-reality-legacy)
  // ==================================
  {
    "filename": "/images/articles/tutankhamun-gold-mask-closeup.jpg",
    "prompt": "Generate an iconic, high-resolution close-up photograph of Tutankhamun's golden death mask. Focus on the stunning details, inlaid lapis lazuli, and serene expression. Set against a plain dark background for maximum impact. Museum quality. Aspect ratio 3:4.",
    "alt_text": "Iconic golden death mask of Pharaoh Tutankhamun from his tomb."
  },
  {
    "filename": "/images/articles/carter-carnarvon-tomb-entrance-bw.jpg",
    "prompt": "Recreate a historical photograph in black and white, capturing the moment Howard Carter and Lord Carnarvon first look into Tutankhamun's tomb (KV62) in 1922. Show them peering through a small opening into the dimly lit interior filled with treasures. Evoke the style and atmosphere of 1920s photography. Aspect ratio 4:3.",
    "alt_text": "Historical black and white photo style: Howard Carter and Lord Carnarvon at Tutankhamun's tomb entrance, 1922."
  },
  {
    "filename": "/images/articles/curse-newspaper-headlines-1920s.jpg",
    "prompt": "Create a composite image simulating several sensationalist newspaper headlines and article snippets from the 1920s focusing on the alleged 'Curse of Tutankhamun' or 'Curse of the Pharaohs' following the tomb discovery and deaths. Use vintage newspaper fonts and layout styles. Aspect ratio 16:9.",
    "alt_text": "Composite of vintage 1920s newspaper headlines about the 'Curse of Tutankhamun'."
  },
  {
    "filename": "/images/articles/lord-carnarvon-photo-portrait.jpg",
    "prompt": "Generate a formal portrait photograph of George Herbert, 5th Earl of Carnarvon (Lord Carnarvon), sponsor of the Tutankhamun excavation. Style should be appropriate for the early 1920s, possibly black and white or sepia toned. Aspect ratio 3:4.",
    "alt_text": "Portrait photograph of Lord Carnarvon, sponsor of the Tutankhamun tomb discovery."
  },
  {
    "filename": "/images/articles/tutankhamun-mummy-ct-scan.jpg",
    "prompt": "Generate an image representing a CT scan of Tutankhamun's mummy. Show a cross-section or 3D rendering derived from scan data, highlighting skeletal structure or specific features discussed in scientific studies. Medical imaging style. Aspect ratio 16:9 or 4:3.",
    "alt_text": "CT scan image revealing details of Tutankhamun's mummy."
  },
  {
    "filename": "/images/articles/tutankhamun-restoring-amun-relief.jpg",
    "prompt": "Create an image in the style of an ancient Egyptian temple relief depicting the young pharaoh Tutankhamun making offerings or being embraced by the god Amun (or Amun-Ra), symbolizing the restoration of the traditional religion after Akhenaten. Standard New Kingdom relief style. Aspect ratio 4:3.",
    "alt_text": "Relief showing Tutankhamun making offerings to the god Amun, symbolizing religious restoration."
  },
  {
    "filename": "/images/articles/tutankhamun-tomb-nested-shrines.jpg",
    "prompt": "Generate a photograph or detailed illustration showing the set of gilded wooden shrines nested one inside the other, as found within Tutankhamun's tomb (KV62), surrounding the sarcophagus. Capture the intricate decorations and golden surfaces. Aspect ratio 16:9.",
    "alt_text": "The nested golden shrines found within Tutankhamun's tomb surrounding his sarcophagus."
  },
  {
    "filename": "/images/articles/tutankhamun-chariot-tomb.jpg",
    "prompt": "Generate a photograph of one of the dismantled gilded chariots found within Tutankhamun's tomb (KV62), perhaps as displayed in a museum. Show the fine craftsmanship and decoration. Aspect ratio 16:9.",
    "alt_text": "One of the ornate gilded chariots discovered in Tutankhamun's tomb."
  },

  // ==================================
  // Article: akhenaten-amarna-revolution (akhenaten-atenism-amarna-period-egypt)
  // ==================================
  {
    "filename": "/images/articles/akhenaten-nefertiti-aten-relief.jpg",
    "prompt": "Generate an image in the distinctive Amarna art style. Depict Pharaoh Akhenaten, Queen Nefertiti, and possibly their daughters standing beneath the Aten sun disk, which emits rays ending in hands offering life (ankh symbols) to the royal family. Show the characteristic elongated features and intimate family portrayal. Limestone relief style. Aspect ratio 16:9.",
    "alt_text": "Amarna period relief showing Akhenaten, Nefertiti, and daughters worshipping the Aten sun disk."
  },
  {
    "filename": "/images/articles/aten-disk-rays-hands.jpg",
    "prompt": "Create a detailed close-up focusing on the Aten sun disk symbol as depicted in Amarna period art. Show the disk prominently at the top, emitting numerous rays that terminate in small hands, some holding ankh symbols. Clear limestone relief or painting style. Aspect ratio 1:1 or 4:3.",
    "alt_text": "Close-up of the Aten sun disk with rays ending in hands, characteristic of Amarna period art."
  },
  {
    "filename": "/images/articles/amarna-city-map-reconstruction.png",
    "prompt": "Generate a map or aerial view reconstruction of the ancient city of Akhetaten (modern Amarna). Show the layout including temples to the Aten, palaces, elite villas, workers' village, and royal tombs in the cliffs. Clear labels for key areas. Aspect ratio 16:9.",
    "alt_text": "Reconstruction map showing the layout of Akhenaten's city, Akhetaten (Amarna)."
  },
  {
    "filename": "/images/articles/amarna-boundary-stela.jpg",
    "prompt": "Generate a photograph of one of the large Boundary Stelae erected by Akhenaten around the city of Amarna. Show the carved relief on the stela, likely depicting the royal family worshipping the Aten, set within the desert landscape of Amarna. Aspect ratio 4:3.",
    "alt_text": "Photograph of an Amarna Boundary Stela carved by Akhenaten."
  },
  {
    "filename": "/images/articles/nefertiti-bust-berlin.jpg",
    "prompt": "Generate an iconic, high-quality photograph of the famous painted limestone bust of Queen Nefertiti, housed in the Neues Museum, Berlin. Capture the exquisite detail, colors, and serene beauty. Neutral museum background. Aspect ratio 3:4.",
    "alt_text": "The famous painted bust of Queen Nefertiti, iconic artwork of the Amarna period."
  },
  {
    "filename": "/images/articles/akhenaten-daughters-relief.jpg",
    "prompt": "Generate an image in the Amarna art style showing an intimate scene of Akhenaten and/or Nefertiti affectionately interacting with their young daughters. Highlight the naturalistic (though still stylized) portrayal and emotional connection unique to this period. Limestone relief style. Aspect ratio 4:3.",
    "alt_text": "Amarna style relief depicting Akhenaten and Nefertiti affectionately with their daughters."
  },
  {
    "filename": "/images/articles/akhenaten-defaced-cartouche.jpg",
    "prompt": "Generate a photograph focusing on a section of an ancient Egyptian monument (temple wall, statue base) showing a royal cartouche where the name of Akhenaten has been clearly and deliberately chiselled out or defaced (damnatio memoriae). Highlight the erasure. Aspect ratio 4:3.",
    "alt_text": "Close-up of a defaced royal cartouche showing the erasure of Akhenaten's name."
  },

  // ==================================
  // Article: cleopatra-politician-rome (cleopatra-vii-egypt-rome-politics-biography)
  // ==================================
  {
    "filename": "/images/articles/cleopatra-dendera-relief.jpg",
    "prompt": "Generate an image showing the large relief carving from the rear wall of the Temple of Hathor at Dendera. Depict Cleopatra VII and her son Caesarion depicted in traditional pharaonic style making offerings to Egyptian gods. Clear Egyptian relief style. Aspect ratio 16:9.",
    "alt_text": "Relief carving from Dendera Temple showing Cleopatra VII and Caesarion in pharaonic style."
  },
  {
    "filename": "/images/articles/cleopatra-coin-portrait.jpg",
    "prompt": "Generate a realistic image of an ancient silver or bronze coin featuring a portrait profile of Queen Cleopatra VII. Show the characteristic features associated with her coinage (hooked nose, determined chin). Slightly worn coin texture. Aspect ratio 1:1.",
    "alt_text": "Ancient coin featuring a portrait of Queen Cleopatra VII of Egypt."
  },
  {
    "filename": "/images/articles/ptolemaic-egypt-map.png",
    "prompt": "Create a historical map illustrating the Ptolemaic Kingdom of Egypt during the Hellenistic period (approx. 305-30 BC). Show its core territory along the Nile, Alexandria as capital, and its influence or control over Cyprus, Cyrenaica, and parts of the Levant/Anatolia at its height. Aspect ratio 16:9.",
    "alt_text": "Map showing the extent of the Ptolemaic Kingdom ruling Egypt during the Hellenistic period."
  },
  {
    "filename": "/images/articles/cleopatra-caesar-painting-interpretive.jpg",
    "prompt": "Generate an image in the style of a 19th-century historical painting depicting the legendary meeting of Cleopatra VII and Julius Caesar. Show Cleopatra being dramatically presented to Caesar, perhaps smuggled in a rug. Acknowledge artistic interpretation, focus on the drama and exotic setting. Aspect ratio 16:9.",
    "alt_text": "Interpretive historical painting depicting the dramatic meeting of Cleopatra and Julius Caesar."
  },
  {
    "filename": "/images/articles/cleopatra-as-isis-stela.jpg",
    "prompt": "Create an image of an ancient Egyptian stela or relief carving where Cleopatra VII is depicted dressed as the goddess Isis, perhaps wearing Isis's horned sun-disk crown and making offerings. Traditional Egyptian art style. Aspect ratio 3:4.",
    "alt_text": "Egyptian stela or relief showing Cleopatra VII depicted in the guise of the goddess Isis."
  },
  {
    "filename": "/images/articles/cleopatra-antony-coin.jpg",
    "prompt": "Generate a realistic image of an ancient silver coin (denarius) featuring jugate (paired) portraits or portraits on opposite sides of Queen Cleopatra VII and the Roman general Mark Antony. Show worn coin texture. Aspect ratio 1:1.",
    "alt_text": "Ancient coin featuring portraits of Mark Antony and Queen Cleopatra VII."
  },
  {
    "filename": "/images/articles/battle-of-actium-map-diagram.png",
    "prompt": "Create a clear map or diagram illustrating the key phases or positions of the naval Battle of Actium (31 BC) between the fleets of Octavian (Agrippa) and the combined forces of Mark Antony and Cleopatra VII. Show the coastline near Actium, Greece. Aspect ratio 16:9.",
    "alt_text": "Map or diagram illustrating the naval Battle of Actium, 31 BC."
  },
  {
    "filename": "/images/articles/death-of-cleopatra-painting-reni.jpg",
    "prompt": "Generate an image depicting the famous 'Death of Cleopatra' scene in the style of a dramatic Baroque or Neoclassical painting (like Guido Reni or Jean-Léon Gérôme). Show Cleopatra, elegantly attired, applying the asp to her breast or arm, often with grieving attendants nearby. Focus on pathos and historical interpretation. Aspect ratio 4:3.",
    "alt_text": "Dramatic historical painting depicting the Death of Cleopatra, possibly with an asp."
  },

  // ==================================
  // Article: divine-kingship-egypt (egyptian-pharaoh-divine-kingship-god-king)
  // ==================================
  {
    "filename": "/images/articles/pharaoh-horus-protection.jpg",
    "prompt": "Generate a photograph of the famous diorite statue of Pharaoh Khafre seated, with the Horus falcon protectively embracing the back of his head with its wings. Highlight the smooth stone and regal posture. Cairo Museum context implied. Aspect ratio 3:4.",
    "alt_text": "Statue of Pharaoh Khafre protected by the Horus falcon wrapped around his head."
  },
  {
    "filename": "/images/articles/pharaoh-double-crown-uraeus.jpg",
    "prompt": "Create a clear illustration or photograph focusing on the head of an Egyptian pharaoh (statue or relief) wearing the Pschent (Double Crown), symbolizing rule over Upper and Lower Egypt. Clearly show the Uraeus cobra at the front of the crown. Aspect ratio 1:1 or 3:4.",
    "alt_text": "Close-up of an Egyptian pharaoh wearing the Pschent (Double Crown) with the Uraeus cobra."
  },
  {
    "filename": "/images/articles/pharaoh-offering-to-gods-relief.jpg",
    "prompt": "Generate an image in the style of a classic Egyptian temple relief carving. Depict a pharaoh, identified by royal regalia, standing before one or more major deities (e.g., Amun, Osiris, Horus, Ma'at) and presenting offerings (incense, food, libations). Clear hieroglyphic figures. Aspect ratio 16:9.",
    "alt_text": "Egyptian temple relief showing a pharaoh making offerings to the gods."
  },
  {
    "filename": "/images/articles/egyptian-royal-regalia-chart.png",
    "prompt": "Create an informative chart or diagram illustrating key items of ancient Egyptian royal regalia. Include clear drawings and labels for the White Crown (Hedjet), Red Crown (Deshret), Double Crown (Pschent), Nemes headdress, Blue Crown (Khepresh), Crook (Heka), and Flail (Nekhakha). Aspect ratio 16:9.",
    "alt_text": "Diagram showing various crowns, sceptres, and other royal regalia of Egyptian pharaohs."
  },
  {
    "filename": "/images/articles/temple-ritual-scene-pharaoh.jpg",
    "prompt": "Generate an image depicting a scene inside an Egyptian temple sanctuary, based on relief carvings. Show a pharaoh (or high priest acting for him) performing a specific daily ritual before the statue or barque of a god. Dim, sacred atmosphere. Aspect ratio 4:3.",
    "alt_text": "Egyptian relief style scene showing a pharaoh performing a ritual inside a temple."
  },
  {
    "filename": "/images/articles/mortuary-temple-medinet-habu.jpg",
    "prompt": "Generate a wide-angle photograph of the well-preserved Mortuary Temple of Ramses III at Medinet Habu on the West Bank of Luxor. Show the impressive pylons, courtyards, and massive relief carvings covering the walls. Aspect ratio 16:9.",
    "alt_text": "View of the Mortuary Temple of Ramses III at Medinet Habu, Luxor."
  },

  // ==================================
  // Article: day-in-the-life-egypt (ancient-egypt-daily-life-common-people-society)
  // ==================================
  {
    "filename": "/images/articles/egyptian-daily-life-tomb-scene.jpg",
    "prompt": "Create a vibrant scene in the style of an ancient Egyptian tomb painting (e.g., from Tomb of Nakht or Sennedjem) depicting various daily life activities. Show farming, crafting, fishing, or feasting, illustrating the lives of common people or nobles. Aspect ratio 16:9.",
    "alt_text": "Egyptian tomb painting illustrating scenes of daily life in ancient Egypt."
  },
  {
    "filename": "/images/articles/egyptian-farming-plowing-harvesting.jpg",
    "prompt": "Generate an image in the style of an Egyptian tomb painting detail focusing on agricultural activities. Show farmers plowing fields with oxen, sowing seeds, and harvesting grain (like emmer wheat or barley) along the Nile. Aspect ratio 16:9.",
    "alt_text": "Tomb painting detail showing ancient Egyptian farmers plowing, sowing, and harvesting."
  },
  {
    "filename": "/images/articles/egyptian-craftsmen-workshop-model.jpg",
    "prompt": "Generate a photograph of an ancient Egyptian wooden tomb model depicting a busy workshop scene, such as a bakery, brewery, or carpentry shop (similar to models from Meketre's tomb). Show miniature figures engaged in their tasks. Museum context. Aspect ratio 4:3.",
    "alt_text": "Ancient Egyptian wooden tomb model showing craftsmen at work in a workshop."
  },
  {
    "filename": "/images/articles/egyptian-relief-craftsmen-working.jpg",
    "prompt": "Create an image in the style of an ancient Egyptian relief carving (e.g., from a Saqqara mastaba) showing various craftsmen at work. Depict sculptors carving statues, carpenters building furniture, or metalworkers forging tools. Aspect ratio 16:9.",
    "alt_text": "Egyptian relief carving depicting various artisans and craftsmen at work."
  },
  {
    "filename": "/images/articles/egyptian-seated-scribe-statue.jpg",
    "prompt": "Generate a high-quality photograph of a famous ancient Egyptian 'Seated Scribe' statue (like the one in the Louvre or Cairo Museum). Show the scribe seated cross-legged, holding a papyrus roll, with inlaid eyes looking alert. Capture the realism and importance of the figure. Aspect ratio 3:4.",
    "alt_text": "Famous ancient Egyptian statue of a Seated Scribe, representing literacy and administration."
  },
  {
    "filename": "/images/articles/hieratic-script-ostracon.jpg",
    "prompt": "Generate a photograph of an ancient Egyptian ostracon (a limestone flake or pottery shard) inscribed with cursive Hieratic script. Show the texture of the material and the flowing lines of the everyday script. Aspect ratio 1:1 or 4:3.",
    "alt_text": "Ancient Egyptian ostracon inscribed with cursive Hieratic script."
  },
  {
    "filename": "/images/articles/egyptian-noble-villa-reconstruction.jpg",
    "prompt": "Generate a detailed architectural reconstruction illustration of a large ancient Egyptian noble's villa, perhaps based on Amarna examples. Show multiple rooms, a central courtyard, possibly columns, servants' quarters, and a walled garden with a pool. Aspect ratio 16:9.",
    "alt_text": "Architectural reconstruction of a wealthy ancient Egyptian noble's villa with garden."
  },
  {
    "filename": "/images/articles/egyptian-banquet-scene-tomb.jpg",
    "prompt": "Create a vibrant image in the style of a detailed New Kingdom tomb painting (e.g., Nebamun, Rekhmire) depicting a lively banquet scene. Show elegantly dressed guests seated, being served food and wine, entertained by musicians and dancers. Aspect ratio 16:9.",
    "alt_text": "Egyptian tomb painting depicting a festive banquet scene with music and dancing."
  },
  {
    "filename": "/images/articles/egyptian-house-model-drawing.jpg",
    "prompt": "Generate an image showing either a simple ancient Egyptian tomb model of a house OR a clear architectural drawing/reconstruction of a typical commoner's mudbrick house with 2-4 rooms and a flat roof. Focus on the basic structure. Aspect ratio 4:3.",
    "alt_text": "Model or drawing illustrating a typical ancient Egyptian mudbrick house."
  },
  {
    "filename": "/images/articles/egyptian-family-stela.jpg",
    "prompt": "Generate a photograph of an ancient Egyptian limestone stela featuring a relief carving of a family group. Typically shows a husband and wife seated, often with children standing nearby, receiving offerings or expressing affection. Aspect ratio 3:4.",
    "alt_text": "Ancient Egyptian stela showing a carved relief portrait of a family."
  },
  {
    "filename": "/images/articles/senet-game-board-ancient-egypt.jpg",
    "prompt": "Generate a photograph of an actual ancient Egyptian Senet game board artifact, possibly made of wood or faience, showing the grid of squares and perhaps some game pieces. Museum quality display. Aspect ratio 4:3.",
    "alt_text": "Photograph of an ancient Egyptian Senet game board artifact."
  },
  {
    "filename": "/images/articles/egyptian-musicians-dancers-relief.jpg",
    "prompt": "Create an image in the style of an Egyptian relief carving or painting depicting musicians playing instruments (harp, lute, flute, sistrum) and dancers performing, often associated with banquets or religious festivals. Aspect ratio 16:9.",
    "alt_text": "Egyptian relief or painting showing ancient musicians and dancers."
  },

  // ==================================
  // Article: ancient-egyptian-diet-details (ancient-egyptian-diet-food-beer-bread-nutrition)
  // ==================================
  {
    "filename": "/images/articles/egyptian-food-offering-table.jpg",
    "prompt": "Generate a photograph or clear illustration of an ancient Egyptian offering table, either the artifact itself or a depiction from a tomb painting, piled high with representations of various foods: loaves of bread, cuts of meat, poultry, vegetables, fruit, and jars of beer/wine. Aspect ratio 4:3.",
    "alt_text": "Ancient Egyptian offering table laden with depictions of bread, meat, vegetables and drink."
  },
  {
    "filename": "/images/articles/egyptian-bakery-brewery-model.jpg",
    "prompt": "Generate a photograph of an ancient Egyptian wooden tomb model specifically depicting a combined bakery and brewery. Show miniature figures grinding grain, kneading dough, tending ovens, mashing grain for beer, and straining liquid into jars. Aspect ratio 4:3.",
    "alt_text": "Ancient Egyptian wooden tomb model depicting integrated bakery and brewery activities."
  },
  {
    "filename": "/images/articles/bread-beer-making-relief.jpg",
    "prompt": "Create an image in the style of an Egyptian relief carving or tomb painting clearly illustrating the processes of bread making (grinding, kneading, baking in conical molds) and beer making (mashing grain, straining into vessels). Aspect ratio 16:9.",
    "alt_text": "Egyptian relief or painting showing the processes of making bread and beer."
  },
  {
    "filename": "/images/articles/egyptian-vegetable-fruit-offerings-painting.jpg",
    "prompt": "Generate an image detail from an Egyptian tomb painting showcasing offerings of various fruits and vegetables. Clearly depict items like onions, garlic, leeks, lettuce, cucumbers, melons, dates, figs, pomegranates, and grapes, often carried in baskets or arranged on mats. Aspect ratio 16:9.",
    "alt_text": "Detail from Egyptian tomb painting showing offerings of various fruits and vegetables."
  },
  {
    "filename": "/images/articles/preserved-dates-egyptian-tomb.jpg",
    "prompt": "Generate a photograph of actual preserved dates found as food offerings within an ancient Egyptian tomb. Show the dried fruit, perhaps in a simple bowl or basket artifact. Aspect ratio 4:3.",
    "alt_text": "Photograph of preserved dates found as ancient Egyptian tomb offerings."
  },
  {
    "filename": "/images/articles/egyptian-fishing-fowling-marsh-scene.jpg",
    "prompt": "Create a vibrant scene in the style of a New Kingdom tomb painting (like Nebamun's) depicting fishing with nets or spears and fowling (hunting birds) with throwsticks in a lush Nile marsh environment filled with papyrus, birds, and fish. Aspect ratio 16:9.",
    "alt_text": "Egyptian tomb painting depicting dynamic fishing and fowling scenes in the Nile marshes."
  },
  {
    "filename": "/images/articles/cattle-herding-egyptian-relief.jpg",
    "prompt": "Generate an image in the style of an Egyptian relief carving (often from Old Kingdom mastabas) showing scenes of cattle herding, inspection, and sometimes crossing water, illustrating the importance of livestock. Aspect ratio 16:9.",
    "alt_text": "Egyptian relief carving showing scenes of cattle herding and animal husbandry."
  },
  {
    "filename": "/images/articles/egyptian-beekeeping-relief.jpg",
    "prompt": "Create an image detail from an Egyptian tomb relief or painting (like Tomb of Rekhmire) specifically showing the practice of ancient beekeeping. Depict cylindrical hives and workers collecting honey. Aspect ratio 4:3.",
    "alt_text": "Detail from Egyptian relief or painting showing ancient beekeeping practices."
  },
  {
    "filename": "/images/articles/egyptian-banquet-vs-farmer-meal.jpg",
    "prompt": "Create a conceptual comparison image. Side-by-side: On one side, a detail from a lavish Egyptian banquet scene (tomb painting style) with rich food, wine, music. On the other side, a simpler depiction (relief or painting style) of farmers eating a basic meal of bread, onions, and perhaps beer in the fields. Aspect ratio 16:9.",
    "alt_text": "Comparison illustrating the contrast between an elite Egyptian banquet and a common farmer's meal."
  },
  {
    "filename": "/images/articles/egyptian-tomb-food-offerings.jpg",
    "prompt": "Generate a photograph showing a collection of actual desiccated or preserved food offerings found in an Egyptian tomb, such as loaves of bread, dried meats or poultry, and sealed jars, displayed in a museum setting. Aspect ratio 16:9.",
    "alt_text": "Photograph of actual preserved ancient Egyptian food offerings discovered in a tomb."
  },

  // ==================================
  // Article: egyptian-women-rights-roles (ancient-egyptian-women-rights-independence-roles)
  // ==================================
  {
    "filename": "/images/articles/egyptian-women-independent-figures.jpg",
    "prompt": "Generate an image montage or selection showcasing diverse representations of ancient Egyptian women from art (statues, reliefs, paintings). Include figures shown independently, participating in activities, or holding positions of status, emphasizing their active roles. Aspect ratio 16:9.",
    "alt_text": "Montage showing diverse representations of women in ancient Egyptian art, highlighting their roles."
  },
  {
    "filename": "/images/articles/egyptian-woman-property-document.jpg",
    "prompt": "Generate an image of an ancient Egyptian papyrus document written in Hieratic or Demotic script, representing a legal contract (like a marriage contract or property deed) involving a woman. Focus on the papyrus texture and script. Aspect ratio 4:3.",
    "alt_text": "Ancient Egyptian papyrus representing a legal document involving a woman's rights or property."
  },
  {
    "filename": "/images/articles/stela-woman-offering-agency.jpg",
    "prompt": "Generate a photograph of an ancient Egyptian stela where a non-royal woman is depicted prominently making an offering to a deity, showcasing female piety and agency in religious practice. Limestone relief carving. Aspect ratio 3:4.",
    "alt_text": "Egyptian stela showing a woman making an offering, demonstrating religious agency."
  },
  {
    "filename": "/images/articles/rahotep-nofret-statue-couple.jpg",
    "prompt": "Generate a high-quality photograph of the famous painted limestone statues of Prince Rahotep and his wife Nofret from the Old Kingdom. Capture the lifelike painted details and the affectionate yet formal pose of the couple. Cairo Museum context implied. Aspect ratio 4:3.",
    "alt_text": "Famous painted statues of the Old Kingdom couple Rahotep and Nofret."
  },
  {
    "filename": "/images/articles/egyptian-women-musicians-weavers-painting.jpg",
    "prompt": "Create an image in the style of an Egyptian tomb painting depicting women engaged in professional activities like playing musical instruments (harp, lute, flute) in an ensemble OR working together at looms weaving linen textiles. Aspect ratio 16:9.",
    "alt_text": "Egyptian tomb painting showing women working as musicians or weavers."
  },
  {
    "filename": "/images/articles/priestess-hathor-statue.jpg",
    "prompt": "Generate a photograph of an ancient Egyptian statue representing a priestess, possibly identifiable by specific attire or symbols associated with a goddess like Hathor or Isis (e.g., holding a sistrum). Stone or bronze material. Aspect ratio 3:4.",
    "alt_text": "Ancient Egyptian statue representing a priestess, possibly of Hathor or Isis."
  },
  {
    "filename": "/images/articles/gods-wife-of-amun-relief.jpg",
    "prompt": "Create an image in the style of a Karnak Temple relief depicting a powerful woman holding the title 'God's Wife of Amun' (often a queen or princess) performing rituals or interacting with the god Amun. Show characteristic regalia associated with the title. Aspect ratio 4:3.",
    "alt_text": "Temple relief depicting a 'God's Wife of Amun' performing religious duties at Karnak."
  },
  {
    "filename": "/images/articles/egyptian-family-portrait-statue.jpg",
    "prompt": "Generate a photograph of an ancient Egyptian statue group depicting a family, typically an official seated with his wife and one or more children standing beside or between them. Convey familial connection within the formal artistic style. Aspect ratio 4:3.",
    "alt_text": "Ancient Egyptian statue group portraying an official with his wife and children."
  },

  // ==================================
  // Article: ancient-egyptian-homes (ancient-egyptian-homes-houses-architecture-daily-life)
  // ==================================
  {
    "filename": "/images/articles/egyptian-house-reconstruction-complex.jpg",
    "prompt": "Generate a detailed architectural reconstruction illustration or digital rendering of a complex ancient Egyptian house, like a noble's villa or a multi-story town house. Show mudbrick construction, flat roof, small windows, possibly a courtyard or garden. Aspect ratio 16:9.",
    "alt_text": "Architectural reconstruction of a complex ancient Egyptian house or villa."
  },
  {
    "filename": "/images/articles/ancient-egyptian-mudbricks.jpg",
    "prompt": "Generate a close-up photograph showing the texture and composition of several ancient Egyptian sun-dried mudbricks, possibly with visible straw temper. Could be part of an excavated wall or stacked. Aspect ratio 4:3.",
    "alt_text": "Close-up photograph showing ancient Egyptian sun-dried mudbricks with straw temper."
  },
  {
    "filename": "/images/articles/mudbrick-making-reconstruction.jpg",
    "prompt": "Generate an illustration or reconstruction scene depicting ancient Egyptians making mudbricks. Show workers mixing Nile mud and straw, pressing the mixture into wooden molds, and laying the bricks out to dry in the sun. Aspect ratio 16:9.",
    "alt_text": "Reconstruction scene showing ancient Egyptians making mudbricks."
  },
  {
    "filename": "/images/articles/deir-el-medina-workers-house-plan.png",
    "prompt": "Create a clear architectural floor plan drawing of a typical worker's house from the village of Deir el-Medina. Show the standard layout: entrance room, main living room, bedroom(s), rear kitchen/storage area, stairs to roof. Label key areas. Aspect ratio 1:1 or 4:3.",
    "alt_text": "Floor plan of a typical worker's house from the ancient Egyptian village of Deir el-Medina."
  },
  {
    "filename": "/images/articles/egyptian-village-home-reconstruction.jpg",
    "prompt": "Generate a simple reconstruction illustration of a modest ancient Egyptian village house made of mudbrick. Show a small, single-story dwelling with a flat roof, perhaps with people engaged in daily activities outside. Aspect ratio 16:9.",
    "alt_text": "Reconstruction illustration of a simple mudbrick village home in ancient Egypt."
  },
  {
    "filename": "/images/articles/egyptian-town-house-reconstruction.jpg",
    "prompt": "Generate a reconstruction illustration of a slightly more substantial ancient Egyptian town house, possibly two stories high, built closely with neighbours in a town setting (like Amarna or Kahun). Mudbrick construction, flat roof. Aspect ratio 4:3.",
    "alt_text": "Reconstruction illustration of a multi-story ancient Egyptian town house."
  },
  {
    "filename": "/images/articles/amarna-town-foundations.jpg",
    "prompt": "Generate a photograph showing the excavated stone or mudbrick foundations of houses at the ancient city of Amarna (Akhetaten), revealing the layout of rooms and streets. Archaeological site context. Aspect ratio 16:9.",
    "alt_text": "Photograph showing the excavated foundations of houses at Amarna, revealing the ancient city layout."
  },
  {
    "filename": "/images/articles/noble-villa-garden-reconstruction.jpg",
    "prompt": "Generate a beautiful reconstruction illustration of the walled garden of an ancient Egyptian noble's villa. Show a central rectangular pool surrounded by sycamore fig trees, date palms, and flowering plants like lotus. Possibly include a small pavilion or kiosk. Aspect ratio 16:9.",
    "alt_text": "Reconstruction illustration of a lush, walled garden with a pool from an Egyptian noble's villa."
  },
  {
    "filename": "/images/articles/amarna-palace-painted-wall-fragment.jpg",
    "prompt": "Generate a photograph of a well-preserved painted wall fragment from a palace or villa at Amarna. Show the distinctive Amarna art style depicting naturalistic scenes of birds, plants, or animals in vibrant colors on plaster. Museum display. Aspect ratio 4:3.",
    "alt_text": "Painted wall fragment from Amarna showing naturalistic birds and plants in vibrant colors."
  },
  {
    "filename": "/images/articles/tutankhamun-tomb-furniture.jpg",
    "prompt": "Generate a photograph showcasing several examples of ornate ancient Egyptian furniture discovered in Tutankhamun's tomb. Could include gilded chairs, inlaid chests, beds with animal legs, or stools. Museum display context. Aspect ratio 16:9.",
    "alt_text": "Examples of ornate gilded and inlaid furniture found in Tutankhamun's tomb."
  },
  {
    "filename": "/images/articles/windcatcher-malqaf-diagram.png",
    "prompt": "Create a clear diagram illustrating how an ancient Egyptian windcatcher (malqaf) works. Show a cross-section of a house with the rooftop structure catching the prevailing wind and directing cool air downwards into the living spaces. Aspect ratio 1:1 or 4:3.",
    "alt_text": "Diagram explaining the function of an ancient Egyptian windcatcher (malqaf) for cooling houses."
  },

  // ==================================
  // Article: ancient-egyptian-leisure-fun (ancient-egyptian-leisure-games-music-festivals-fun)
  // ==================================
  {
    "filename": "/images/articles/egyptian-leisure-activities-montage.jpg",
    "prompt": "Create an engaging montage combining various ancient Egyptian leisure activities depicted in art. Include elements like people playing Senet, musicians with instruments, dancers, banquet scenes, and perhaps fowling or fishing scenes. Blend harmoniously. Aspect ratio 16:9.",
    "alt_text": "Montage illustrating various ancient Egyptian leisure activities like games, music, and festivals."
  },
  {
    "filename": "/images/articles/senet-game-tutankhamun-tomb.jpg",
    "prompt": "Generate a photograph of one of the beautiful Senet game boards found in Tutankhamun's tomb, made of materials like ebony, ivory, or faience. Show the detailed craftsmanship. Museum display. Aspect ratio 4:3.",
    "alt_text": "Ornate Senet game board discovered in the tomb of Tutankhamun."
  },
  {
    "filename": "/images/articles/egyptians-playing-senet-tomb-painting.jpg",
    "prompt": "Create an image in the style of an Egyptian tomb painting showing two people, seated perhaps on stools, intently playing the board game Senet. Capture the focus and leisure aspect. Aspect ratio 4:3.",
    "alt_text": "Ancient Egyptian tomb painting depicting two people playing the board game Senet."
  },
  {
    "filename": "/images/articles/ancient-egyptian-toys-display.jpg",
    "prompt": "Generate a photograph of a collection of ancient Egyptian children's toys displayed in a museum. Include items like simple wooden animals on wheels, carved dolls (paddle dolls), balls made of reed or leather, and spinning tops. Aspect ratio 16:9.",
    "alt_text": "Museum display of ancient Egyptian children's toys including dolls, animals, and balls."
  },
  {
    "filename": "/images/articles/egyptian-musicians-dancers-banquet-painting.jpg",
    "prompt": "Create a vibrant scene in the style of an Egyptian tomb painting depicting musicians (playing harp, lute, flute) and acrobatic dancers entertaining guests at a banquet. Show movement and festivity. Aspect ratio 16:9.",
    "alt_text": "Egyptian tomb painting showing musicians and dancers performing at a banquet."
  },
  {
    "filename": "/images/articles/ancient-egyptian-harp.jpg",
    "prompt": "Generate a photograph of an actual ancient Egyptian arched harp artifact, perhaps displayed in a museum. Show the wooden frame and pegs for strings (strings likely missing). Aspect ratio 3:4.",
    "alt_text": "Photograph of an ancient Egyptian arched harp artifact."
  },
  {
    "filename": "/images/articles/egyptian-banquet-scene-nebamun-detail.jpg",
    "prompt": "Generate a high-resolution image focusing on a detailed section of the banquet scene from the Tomb of Nebamun (British Museum). Show the elegantly dressed guests, musicians, dancers, and offerings. Capture the vibrant colors and fine details of the painting. Aspect ratio 16:9.",
    "alt_text": "Detailed section of the famous banquet scene from the Tomb of Nebamun."
  },
  {
    "filename": "/images/articles/nebamun-fowling-scene-british-museum.jpg",
    "prompt": "Generate a high-resolution image of the iconic 'Fowling in the Marshes' scene from the Tomb of Nebamun (British Museum). Show Nebamun standing on a papyrus skiff with his wife and daughter, hunting birds with a throwstick in a teeming marsh environment. Aspect ratio 4:3.",
    "alt_text": "Iconic Egyptian tomb painting 'Fowling in the Marshes' from the Tomb of Nebamun."
  },
  {
    "filename": "/images/articles/pharaoh-hunting-relief.jpg",
    "prompt": "Create an image in the style of a dynamic Egyptian temple relief depicting a pharaoh hunting wild animals (like lions or bulls) from a chariot in the desert. Show action, power, and royal prowess. Aspect ratio 16:9.",
    "alt_text": "Egyptian temple relief showing a pharaoh hunting wild animals from a chariot."
  },
  {
    "filename": "/images/articles/opet-festival-procession-luxor-relief.jpg",
    "prompt": "Generate an image depicting a section of the relief carvings from the Colonnade Hall at Luxor Temple showing the Opet Festival procession. Show priests carrying the sacred barques of the Theban triad (Amun, Mut, Khonsu) amidst crowds, musicians, and dancers. Aspect ratio 21:9 or 16:9.",
    "alt_text": "Relief carving from Luxor Temple depicting the procession of sacred barques during the Opet Festival."
  },

  // ==================================
  // Article: building-great-pyramid (how-great-pyramid-giza-built-engineering-theories)
  // ==================================
  {
    "filename": "/images/articles/great-pyramid-giza-sunset.jpg",
    "prompt": "Generate a stunning, photorealistic image of the Great Pyramid of Giza silhouetted against a dramatic sunset sky. Include the other Giza pyramids faintly in the background for scale and context. Warm, golden hour lighting. Aspect ratio 16:9.",
    "alt_text": "The Great Pyramid of Giza silhouetted against a beautiful sunset."
  },
  {
    "filename": "/images/articles/pyramid-evolution-diagram.png",
    "prompt": "Create a clear diagram illustrating the architectural evolution of Egyptian royal tombs: from a simple mastaba, to Djoser's Step Pyramid, to Sneferu's experimental Bent Pyramid, culminating in the true pyramid form (like the Red Pyramid or Giza pyramids). Show profile views and labels. Aspect ratio 16:9.",
    "alt_text": "Diagram showing the evolution of Egyptian royal tombs from mastaba to true pyramid."
  },
  {
    "filename": "/images/articles/step-pyramid-bent-pyramid-photos.jpg",
    "prompt": "Create a composite image or two side-by-side photographs comparing Djoser's Step Pyramid at Saqqara and Sneferu's Bent Pyramid at Dahshur. Show the distinct shapes and architectural stages they represent. Aspect ratio 16:9.",
    "alt_text": "Comparison photographs of the Step Pyramid at Saqqara and the Bent Pyramid at Dahshur."
  },
  {
    "filename": "/images/articles/aswan-quarry-unfinished-obelisk.jpg",
    "prompt": "Generate a photograph of the famous Unfinished Obelisk lying in the ancient granite quarry at Aswan, Egypt. Show the immense size of the monolith and the tool marks indicating how it was being carved from the bedrock. Aspect ratio 16:9.",
    "alt_text": "The massive Unfinished Obelisk lying in the ancient granite quarry at Aswan."
  },
  {
    "filename": "/images/articles/quarrying-techniques-diagram.png",
    "prompt": "Create diagrams illustrating ancient Egyptian stone quarrying techniques. Include depictions of using pounders (dolerite balls), channeling with copper/bronze tools, and using wooden wedges expanded with water to split granite or limestone. Aspect ratio 16:9.",
    "alt_text": "Diagrams illustrating ancient Egyptian stone quarrying techniques like pounding and using wedges."
  },
  {
    "filename": "/images/articles/statue-moved-on-sledge-relief.jpg",
    "prompt": "Generate an image based on the famous relief from the tomb of Djehutihotep at El-Bersheh. Depict numerous workers hauling a colossal seated statue on a large wooden sledge, with one person pouring liquid (water?) in front of the sledge to reduce friction. Aspect ratio 16:9.",
    "alt_text": "Egyptian relief showing workers hauling a colossal statue on a sledge, based on El-Bersheh tomb."
  },
  {
    "filename": "/images/articles/giza-quarry-transport-map.png",
    "prompt": "Create a map showing the Giza pyramid plateau relative to the Nile River, the local Giza limestone quarries, the Tura limestone quarries (across the Nile), and the distant Aswan granite quarries. Indicate potential river transport routes for materials. Aspect ratio 16:9.",
    "alt_text": "Map showing Giza plateau, quarries (Giza, Tura, Aswan), and Nile transport routes."
  },
  {
    "filename": "/images/articles/pyramid-ramp-theories-diagrams.png",
    "prompt": "Create clear, informative diagrams illustrating various scientific theories for ancient Egyptian pyramid construction ramps. Include depictions of a long external straight ramp, a zig-zagging external ramp, and a possible internal ramp system within the pyramid structure. Use simple graphics and labels. Aspect ratio 16:9.",
    "alt_text": "Diagrams illustrating different theories of ramp construction for the Egyptian pyramids."
  },
  {
    "filename": "/images/articles/pyramid-casing-stones-precision.jpg",
    "prompt": "Generate a close-up photograph showing the few remaining polished casing stones at the base of the Great Pyramid of Giza. Emphasize the incredibly fine joints and precision fitting between the massive blocks. Aspect ratio 4:3.",
    "alt_text": "Close-up of the precise jointing between remaining casing stones on the Great Pyramid."
  },
  {
    "filename": "/images/articles/pyramid-alignment-methods-diagram.png",
    "prompt": "Create diagrams illustrating possible ancient Egyptian methods for achieving precise cardinal alignment of the pyramids, such as using the simultaneous rising and setting of a star, or tracking the shadow of a vertical pole (gnomon) to find true north. Aspect ratio 16:9.",
    "alt_text": "Diagrams illustrating possible astronomical methods for aligning the Egyptian pyramids."
  },
  {
    "filename": "/images/articles/giza-workers-village-excavation.jpg",
    "prompt": "Generate a photograph of the archaeological excavations at the Giza workers' village site (Heit el-Ghurab or 'Lost City of the Pyramid Builders'). Show the excavated foundations of bakeries, galleries, and administrative buildings. Aspect ratio 16:9.",
    "alt_text": "Archaeological excavation site of the workers' village near the Giza pyramids."
  },
  {
    "filename": "/images/articles/giza-workers-village-reconstruction.jpg",
    "prompt": "Generate a detailed historical reconstruction illustration of the Giza workers' village (Heit el-Ghurab). Show bustling activity within the mudbrick structures, communal bakeries, and sleeping galleries, depicting the daily lives of the pyramid builders. Based on archaeological findings. Aspect ratio 16:9.",
    "alt_text": "Realistic reconstruction of the Giza workers' village where the pyramid builders lived."
  },
  {
    "filename": "/images/articles/great-pyramid-internal-cutaway-diagram.png",
    "prompt": "Create a clear cutaway diagram illustrating the internal structure of the Great Pyramid of Giza. Label the key known chambers and passages: Subterranean Chamber, Queen's Chamber, Grand Gallery, King's Chamber (with sarcophagus), relieving chambers, and entrance passages. Aspect ratio 4:3 or 16:9.",
    "alt_text": "Cutaway diagram showing the internal chambers and passages of the Great Pyramid of Giza."
  },

  // ==================================
  // Article: karnak-temple-complex (karnak-temple-luxor-egypt-amun-ra-hypostyle-hall)
  // ==================================
  {
    "filename": "/images/articles/karnak-hypostyle-hall-overview.jpg",
    "prompt": "Generate a breathtaking wide-angle photograph looking into the Great Hypostyle Hall at Karnak Temple. Show the dense forest of massive papyrus-form columns, emphasizing the scale and grandeur. Sunlight filtering down from the clerestory windows. Aspect ratio 16:9.",
    "alt_text": "Overview of the massive columns within the Great Hypostyle Hall at Karnak Temple."
  },
  {
    "filename": "/images/articles/karnak-temple-complex-aerial-map.jpg",
    "prompt": "Generate an aerial photograph or detailed satellite map view of the entire Karnak Temple complex in Luxor. Clearly show the main Precinct of Amun-Ra, Precinct of Mut, Precinct of Montu, connecting avenues, and the Sacred Lake. Labels optional but helpful. Aspect ratio 16:9.",
    "alt_text": "Aerial view or map showing the vast scale and layout of the Karnak Temple complex."
  },
  {
    "filename": "/images/articles/karnak-ram-headed-sphinx-avenue.jpg",
    "prompt": "Generate a photograph looking down the Avenue of Sphinxes leading towards Karnak Temple, specifically showing the row of ram-headed sphinxes (criosphinxes) guarding the path. Aspect ratio 16:9.",
    "alt_text": "Avenue of ram-headed sphinxes leading towards the entrance of Karnak Temple."
  },
  {
    "filename": "/images/articles/karnak-first-pylon-entrance.jpg",
    "prompt": "Generate a photograph focusing on the massive First Pylon (main entrance gate) of Karnak Temple. Show its immense size, possibly with people nearby for scale, and the large open courtyard beyond it. Aspect ratio 16:9.",
    "alt_text": "The massive First Pylon entrance gate of the Karnak Temple complex."
  },
  {
    "filename": "/images/articles/karnak-hypostyle-hall-columns-scale.jpg",
    "prompt": "Generate a photograph taken inside the Great Hypostyle Hall at Karnak, specifically framed to emphasize the enormous scale of the columns compared to human figures standing near their base. Aspect ratio 3:4 or 4:3.",
    "alt_text": "View inside Karnak's Great Hypostyle Hall showing the immense scale of columns next to people."
  },
  {
    "filename": "/images/articles/karnak-column-decoration-closeup.jpg",
    "prompt": "Generate a detailed close-up photograph of one of the massive columns in Karnak's Hypostyle Hall. Focus on the intricate raised relief carvings and hieroglyphs covering the surface, showing remnants of original paint if possible. Aspect ratio 3:4.",
    "alt_text": "Close-up detail of relief carvings and hieroglyphs on a column in Karnak's Hypostyle Hall."
  },
  {
    "filename": "/images/articles/hatshepsut-obelisk-karnak.jpg",
    "prompt": "Generate a photograph focusing on the single tall, standing granite obelisk of Hatshepsut within Karnak Temple. Show its full height against the sky or temple structures, highlighting the hieroglyphic inscriptions. Aspect ratio 3:4.",
    "alt_text": "The tall standing granite obelisk of Hatshepsut within Karnak Temple."
  },
  {
    "filename": "/images/articles/karnak-sacred-lake.jpg",
    "prompt": "Generate a photograph of the rectangular Sacred Lake at Karnak Temple, showing its stone embankment and perhaps reflections of nearby temple structures or the giant scarab statue on its waters. Aspect ratio 16:9.",
    "alt_text": "View of the Sacred Lake within the Karnak Temple complex."
  },
  {
    "filename": "/images/articles/karnak-inner-sanctuary-area.jpg",
    "prompt": "Generate a photograph looking deeper into the Karnak Temple complex, beyond the Hypostyle Hall, towards the increasingly restricted inner sanctuaries and the central Holy of Holies area. Convey a sense of sacredness and diminishing light. Aspect ratio 4:3.",
    "alt_text": "View towards the inner sanctuary areas of Karnak Temple."
  },
  {
    "filename": "/images/articles/barque-shrine-reconstruction-karnak.png",
    "prompt": "Create a reconstruction illustration of the central barque shrine within Karnak Temple as it might have appeared in antiquity. Show the enclosed shrine housing the portable sacred barque (boat) containing the image of the god Amun. Based on architectural evidence and depictions. Aspect ratio 4:3.",
    "alt_text": "Reconstruction illustration of the sacred barque shrine of Amun within Karnak Temple."
  },
  {
    "filename": "/images/articles/karnak-construction-timeline-graphic.png",
    "prompt": "Create an informative graphic or timeline illustrating the major construction phases of Karnak Temple over centuries. Indicate key pharaohs (e.g., Senusret I, Thutmose I, Hatshepsut, Thutmose III, Amenhotep III, Ramses II) and the main structures they added (pylons, courts, halls, obelisks). Aspect ratio 16:9.",
    "alt_text": "Timeline graphic showing the major construction phases and pharaohs associated with Karnak Temple."
  },

  // ==================================
  // Article: valley-of-the-kings-tombs (valley-of-the-kings-egypt-royal-tombs-tutankhamun)
  // ==================================
  {
    "filename": "/images/articles/valley-of-the-kings-panorama.jpg",
    "prompt": "Generate a wide panoramic photograph of the Valley of the Kings on Luxor's West Bank. Show the desolate, rocky landscape, the numerous tomb entrances cut into the cliffsides, and the surrounding Theban hills under a clear blue sky. Aspect ratio 21:9 or 16:9.",
    "alt_text": "Panoramic view of the rocky landscape and tomb entrances in the Valley of the Kings, Luxor."
  },
  {
    "filename": "/images/articles/el-qurn-peak-valley-kings.jpg",
    "prompt": "Generate a photograph focusing on the natural pyramid-shaped peak of El-Qurn, the mountain overlooking the Valley of the Kings. Capture its distinctive shape against the sky. Aspect ratio 4:3.",
    "alt_text": "The distinctive pyramid-shaped peak of El-Qurn mountain overlooking the Valley of the Kings."
  },
  {
    "filename": "/images/articles/valley-of-kings-queens-map-thebes.png",
    "prompt": "Create a map of the Theban Necropolis (Luxor West Bank). Clearly mark the locations of the Valley of the Kings, Valley of the Queens, Deir el-Bahri (Hatshepsut's Temple), Medinet Habu, Colossi of Memnon, and Deir el-Medina relative to the Nile River. Aspect ratio 16:9.",
    "alt_text": "Map of the Theban Necropolis showing Valley of the Kings, Queens, and other major sites."
  },
  {
    "filename": "/images/articles/seti-i-tomb-layout-cutaway.png",
    "prompt": "Create a cutaway diagram illustrating the long, complex layout of the Tomb of Seti I (KV17) in the Valley of the Kings. Show the descending corridors, various chambers (including false burial chamber), and the actual burial chamber, indicating the extensive decorations. Aspect ratio 16:9.",
    "alt_text": "Cutaway diagram showing the extensive layout and chambers of the Tomb of Seti I (KV17)."
  },
  {
    "filename": "/images/articles/ramses-vi-tomb-decorated-walls.jpg",
    "prompt": "Generate a photograph taken inside the Tomb of Ramses VI (KV9) in the Valley of the Kings, focusing on the stunningly decorated walls and ceiling of the burial chamber, featuring astronomical scenes (Book of Nut) and underworld texts in vibrant colors. Aspect ratio 16:9.",
    "alt_text": "Vibrantly decorated walls and ceiling inside the burial chamber of the Tomb of Ramses VI (KV9)."
  },
  {
    "filename": "/images/articles/deir-el-medina-village-ruins.jpg",
    "prompt": "Generate a photograph showing the stone foundations and ruins of the ancient workers' village of Deir el-Medina, where the artisans who built the Valley of the Kings tombs lived. Show the layout of the houses and streets. Aspect ratio 16:9.",
    "alt_text": "Ruins of the ancient workers' village of Deir el-Medina on Luxor's West Bank."
  },
  {
    "filename": "/images/articles/deir-el-medina-workers-tomb-decoration.jpg",
    "prompt": "Generate an image showcasing the surprisingly vibrant and well-preserved painted decoration inside one of the tombs of the workers/artisans at Deir el-Medina (e.g., Tomb of Sennedjem or Pashedu). Show lively scenes distinct from royal tomb styles. Aspect ratio 4:3.",
    "alt_text": "Vibrant painted decoration inside a tomb of an artisan from Deir el-Medina."
  },
  {
    "filename": "/images/articles/tomb-robbery-forced-doorway-kv.jpg",
    "prompt": "Generate a photograph focusing on a sealed doorway or entrance within a tomb in the Valley of the Kings that shows clear signs of ancient forced entry or robbery damage (e.g., broken plaster, enlarged hole). Aspect ratio 4:3.",
    "alt_text": "Ancient tomb doorway in the Valley of the Kings showing signs of forced entry by tomb robbers."
  },
  {
    "filename": "/images/articles/tutankhamun-tomb-entrance-kv62.jpg",
    "prompt": "Generate a photograph of the simple, rock-cut entrance stairway leading down into the Tomb of Tutankhamun (KV62) in the Valley of the Kings. Aspect ratio 4:3.",
    "alt_text": "The entrance stairway leading down into Tutankhamun's tomb (KV62) in the Valley of the Kings."
  },
  {
    "filename": "/images/articles/seti-i-tomb-kv17-burial-chamber.jpg",
    "prompt": "Generate a photograph taken inside the beautiful burial chamber of the Tomb of Seti I (KV17), known for its high-quality painted reliefs covering the walls and the astronomical ceiling. Focus on the artistry and colors. Aspect ratio 16:9.",
    "alt_text": "Beautifully decorated burial chamber with painted reliefs in the Tomb of Seti I (KV17)."
  },

  // ==================================
  // Article: beyond-pyramids-tombs-temples (egyptian-architecture-mastabas-rock-tombs-cult-mortuary-temples)
  // ==================================
  {
    "filename": "/images/articles/egyptian-architecture-diversity-collage.jpg",
    "prompt": "Create an architectural collage showcasing the diversity of ancient Egyptian monumental structures. Include images representing a mastaba tomb, a rock-cut tomb entrance, a cult temple pylon, a mortuary temple facade, and perhaps an obelisk or pyramid. Aspect ratio 16:9.",
    "alt_text": "Collage illustrating the diversity of ancient Egyptian architecture: mastaba, rock tomb, temples, pyramid."
  },
  {
    "filename": "/images/articles/mastaba-field-saqqara.jpg",
    "prompt": "Generate a photograph showing a group of Old Kingdom mastaba tombs with their characteristic flat tops and sloping sides, located in the Saqqara necropolis near the Step Pyramid. Aspect ratio 16:9.",
    "alt_text": "Field of ancient Egyptian mastaba tombs at the Saqqara necropolis."
  },
  {
    "filename": "/images/articles/mastaba-cutaway-diagram.png",
    "prompt": "Create a cutaway diagram illustrating the typical structure of an ancient Egyptian mastaba tomb. Show the above-ground rectangular structure with offering chapel/serdab, the vertical shaft, and the subterranean burial chamber. Labels for key parts. Aspect ratio 4:3.",
    "alt_text": "Cutaway diagram showing the structure of an ancient Egyptian mastaba tomb."
  },
  {
    "filename": "/images/articles/beni-hasan-rock-cut-tomb-entrances.jpg",
    "prompt": "Generate a photograph showing the row of rock-cut tomb entrances carved into the cliffs at Beni Hasan, characteristic of the Middle Kingdom period. Show the distinctive porticoed entrances. Aspect ratio 16:9.",
    "alt_text": "Row of Middle Kingdom rock-cut tomb entrances with porticoes at Beni Hasan."
  },
  {
    "filename": "/images/articles/valley-of-the-kings-tomb-entrances.jpg",
    "prompt": "Generate a photograph showing several simple, rock-cut tomb entrances as seen in the Valley of the Kings, cut directly into the limestone cliffs. Aspect ratio 16:9.",
    "alt_text": "View of several rock-cut tomb entrances in the Valley of the Kings."
  },
  {
    "filename": "/images/articles/edfu-temple-pylon-court.jpg",
    "prompt": "Generate a photograph of the exceptionally well-preserved Temple of Horus at Edfu. Focus on the massive entrance pylon, the large open courtyard surrounded by colonnades, and the entrance to the hypostyle hall. Aspect ratio 16:9.",
    "alt_text": "The well-preserved entrance pylon and courtyard of the Temple of Horus at Edfu."
  },
  {
    "filename": "/images/articles/cult-temple-layout-plan.png",
    "prompt": "Create a typical floor plan diagram of an ancient Egyptian cult temple (like Edfu or Karnak). Label the standard elements in sequence: Pylon, Courtyard, Hypostyle Hall, Inner Sanctuaries, Barque Shrine (Holy of Holies). Show axial layout. Aspect ratio 16:9.",
    "alt_text": "Diagram showing the typical layout and elements of an ancient Egyptian cult temple."
  },
  {
    "filename": "/images/articles/hatshepsut-temple-deir-el-bahri-view.jpg",
    "prompt": "Generate a stunning wide-angle photograph of the Mortuary Temple of Hatshepsut at Deir el-Bahri, showcasing its unique terraced design built against the cliffs of the Theban mountains. Aspect ratio 16:9.",
    "alt_text": "Wide view of the uniquely terraced Mortuary Temple of Hatshepsut at Deir el-Bahri."
  },
  {
    "filename": "/images/articles/medinet-habu-reliefs-ramses-iii.jpg",
    "prompt": "Generate a photograph focusing on the extensive and detailed relief carvings covering the exterior walls of the Mortuary Temple of Ramses III at Medinet Habu. Show scenes of battles, processions, or religious rituals. Aspect ratio 16:9.",
    "alt_text": "Detailed relief carvings depicting battles and rituals on the walls of Medinet Habu temple."
  },
  {
    "filename": "/images/articles/sun-temple-abu-ghurab-reconstruction.jpg",
    "prompt": "Generate a historical reconstruction illustration of an Old Kingdom sun temple, like that of Niuserre at Abu Ghurab. Show the main features: large open courtyard, central massive obelisk on a base, altar, and possibly surrounding storage rooms or causeway. Aspect ratio 16:9.",
    "alt_text": "Reconstruction illustration of an Old Kingdom sun temple with central obelisk, like Abu Ghurab."
  },
  {
    "filename": "/images/articles/egyptian-column-types-composite.jpg",
    "prompt": "Create a composite image or chart illustrating different types of ancient Egyptian columns. Include clear examples and labels for papyrus-bud, papyrus-open, lotus, palmiform, and possibly Hathoric or composite columns. Aspect ratio 16:9.",
    "alt_text": "Illustration showing different types of ancient Egyptian columns: papyrus, lotus, palmiform etc."
  },

  // ==================================
  // Article: egyptian-obelisks-engineering (ancient-egyptian-obelisks-engineering-quarrying-erecting)
  // ==================================
  {
    "filename": "/images/articles/karnak-obelisks-pair.jpg",
    "prompt": "Generate a photograph showing a pair of massive granite obelisks standing before a pylon or within a courtyard at Karnak Temple (e.g., those of Thutmose I/Hatshepsut). Emphasize their height and monumental presence. Aspect ratio 4:3.",
    "alt_text": "Pair of towering granite obelisks standing within the Karnak Temple complex."
  },
  {
    "filename": "/images/articles/obelisk-diagram-parts.png",
    "prompt": "Create a clear diagram illustrating the parts of an ancient Egyptian obelisk. Label the monolithic shaft, the tapering sides, and the pyramid-shaped top (pyramidion). Aspect ratio 1:1.",
    "alt_text": "Diagram labeling the main parts of an ancient Egyptian obelisk: shaft and pyramidion."
  },
  {
    "filename": "/images/articles/obelisk-pyramidion-closeup.jpg",
    "prompt": "Generate a close-up photograph focusing on the pyramidion (pyramid-shaped top) of an ancient Egyptian granite obelisk against a clear sky. Highlight the shape and texture. Aspect ratio 1:1 or 4:3.",
    "alt_text": "Close-up view of the pyramidion, the pyramid-shaped top of an Egyptian obelisk."
  },
  {
    "filename": "/images/articles/unfinished-obelisk-aswan-quarry.jpg",
    "prompt": "Generate a photograph of the famous Unfinished Obelisk lying in the ancient granite quarry at Aswan, Egypt. Show the immense size of the monolith and the tool marks indicating how it was being carved from the bedrock. Aspect ratio 16:9.",
    "alt_text": "The massive Unfinished Obelisk lying in the ancient granite quarry at Aswan."
  },
  {
    "filename": "/images/articles/obelisk-erection-methods-diagram.png",
    "prompt": "Create schematic diagrams illustrating plausible ancient Egyptian methods for erecting massive obelisks. Show possibilities like using large earthen ramps, leverage pits, and extensive rope pulling with large teams of workers. Aspect ratio 16:9.",
    "alt_text": "Diagrams illustrating possible ancient methods for erecting Egyptian obelisks using ramps and leverage."
  },
  {
    "filename": "/images/articles/luxor-temple-obelisk-pair-entrance.jpg",
    "prompt": "Generate a photograph of the entrance to Luxor Temple focusing on the single remaining standing obelisk of Ramses II beside the pylon. Contrast it with the empty base where its twin once stood. Aspect ratio 4:3.",
    "alt_text": "The standing obelisk of Ramses II at the entrance pylon of Luxor Temple."
  },
  {
    "filename": "/images/articles/hatshepsut-obelisk-standing-karnak.jpg",
    "prompt": "Generate a photograph focusing on the single tall, standing granite obelisk of Hatshepsut within Karnak Temple. Show its full height against the sky or temple structures, highlighting the hieroglyphic inscriptions. Aspect ratio 3:4.",
    "alt_text": "The tall standing granite obelisk of Hatshepsut within Karnak Temple."
  },
  {
    "filename": "/images/articles/lateran-obelisk-rome.jpg",
    "prompt": "Generate a photograph of the Lateran Obelisk (originally from Karnak Temple) standing tall in the Piazza di San Giovanni in Laterano, Rome. Show the Egyptian obelisk in its current Roman setting, emphasizing its size. Aspect ratio 3:4.",
    "alt_text": "The massive ancient Egyptian Lateran Obelisk standing in Piazza San Giovanni, Rome."
  },
  {
    "filename": "/images/articles/obelisk-hieroglyphs-closeup.jpg",
    "prompt": "Generate a detailed close-up photograph of the deeply carved hieroglyphic inscriptions running down the shaft of an ancient Egyptian granite obelisk. Focus on the clarity and artistry of the symbols. Aspect ratio 4:3.",
    "alt_text": "Close-up detail of deeply carved hieroglyphic inscriptions on an Egyptian obelisk."
  },

  // ==================================
  // Article: egyptian-hieroglyphs-guide (egyptian-hieroglyphs-explained-reading-guide-basics)
  // ==================================
  {
    "filename": "/images/articles/hieroglyphs-painted-tomb-wall.jpg",
    "prompt": "Generate a close-up photograph of a section of a brightly painted ancient Egyptian tomb wall covered in detailed hieroglyphic inscriptions and figures. Highlight the colors and artistry of the formal script. Aspect ratio 16:9.",
    "alt_text": "Detailed view of colorful painted hieroglyphs on an ancient Egyptian tomb wall."
  },
  {
    "filename": "/images/articles/hieroglyph-sign-types-example.png",
    "prompt": "Create an explanatory diagram showing a few examples of Egyptian hieroglyphs used in different ways within a word or phrase. Clearly illustrate and label signs used as phonograms (sound signs), logograms (word signs), and determinatives (sense signs). Aspect ratio 16:9.",
    "alt_text": "Diagram illustrating the different functions of Egyptian hieroglyphs: phonogram, logogram, determinative."
  },
  {
    "filename": "/images/articles/egyptian-hieroglyph-alphabet-chart.png",
    "prompt": "Create a clear chart displaying the common uniliteral (single-consonant) Egyptian hieroglyphs often referred to as the 'hieroglyphic alphabet'. Show the hieroglyph, its approximate sound (transliteration), and a common phonetic equivalent. Aspect ratio 16:9.",
    "alt_text": "Chart showing the common uniliteral signs of the Egyptian hieroglyphic 'alphabet'."
  },
  {
    "filename": "/images/articles/hieroglyph-logograms-examples.png",
    "prompt": "Create an image showcasing several common Egyptian hieroglyphs used as logograms (representing the object depicted or a related concept). Include examples like the sun disk for 'Ra' or 'day', a seated man for 'man', a house plan for 'house'. Clear drawings with labels. Aspect ratio 16:9.",
    "alt_text": "Examples of common Egyptian hieroglyphs used as logograms or ideograms."
  },
  {
    "filename": "/images/articles/hieroglyph-determinative-example.png",
    "prompt": "Create an image clearly illustrating the use of a determinative in Egyptian hieroglyphs. Show a word written phonetically, followed by a determinative sign (e.g., seated man, book roll, town sign) that clarifies the word's meaning category but isn't pronounced. Highlight the determinative. Aspect ratio 4:3.",
    "alt_text": "Example showing how a determinative sign clarifies the meaning of a word in Egyptian hieroglyphs."
  },
  {
    "filename": "/images/articles/hieroglyph-reading-direction-arrows.png",
    "prompt": "Create simple diagrams illustrating how to determine the reading direction of Egyptian hieroglyphs. Show examples of lines read right-to-left, left-to-right, and top-to-bottom, using arrows and pointing out how the figures face the beginning of the line. Aspect ratio 16:9.",
    "alt_text": "Diagrams illustrating the different reading directions for Egyptian hieroglyphs."
  },
  {
    "filename": "/images/articles/tutankhamun-cartouche-example.jpg",
    "prompt": "Generate a close-up photograph or clear illustration focusing on a royal cartouche containing the hieroglyphic name of Tutankhamun (either prenomen Nebkheperure or nomen Tutankhamun). Show the oval shape clearly. Aspect ratio 1:1 or 4:3.",
    "alt_text": "Example of a royal cartouche containing the hieroglyphic name of Pharaoh Tutankhamun."
  },
  {
    "filename": "/images/articles/hieroglyphic-hieratic-demotic-comparison.png",
    "prompt": "Create a comparison chart showing the same short phrase or a few signs written in formal Hieroglyphic script, cursive Hieratic script, and later cursive Demotic script. Illustrate the evolution towards more cursive forms. Aspect ratio 16:9.",
    "alt_text": "Comparison chart showing the evolution from Hieroglyphic to Hieratic and Demotic scripts."
  },
  {
    "filename": "/images/articles/rosetta-stone-british-museum.jpg",
    "prompt": "Generate a high-quality photograph of the Rosetta Stone, likely displayed in the British Museum. Show the stele fragment with its three distinct script bands: Hieroglyphic, Demotic, and Ancient Greek. Focus on the inscribed text. Aspect ratio 3:4.",
    "alt_text": "The Rosetta Stone showing its three scripts: Hieroglyphic, Demotic, and Ancient Greek."
  },

  // ==================================
  // Article: egyptian-art-perspective-symbolism (egyptian-art-perspective-symbolism-conventions-meaning)
  // ==================================
  {
    "filename": "/images/articles/egyptian-art-tomb-painting-stylized.jpg",
    "prompt": "Generate an image of a typical ancient Egyptian tomb painting scene featuring human figures. Clearly show the conventional stylized representation: head in profile, eye frontal, shoulders frontal, hips and limbs in profile. Use traditional colors and flat style. Aspect ratio 16:9.",
    "alt_text": "Example of ancient Egyptian tomb painting showing figures in conventional stylized profile."
  },
  {
    "filename": "/images/articles/egyptian-art-composite-perspective-diagram.png",
    "prompt": "Create a diagram that breaks down a typical Egyptian figure drawing. Show the full figure alongside isolated body parts (profile head, frontal eye, frontal torso, profile limbs) clearly illustrating the concept of composite perspective or aspectivity. Aspect ratio 1:1 or 4:3.",
    "alt_text": "Diagram explaining composite perspective (aspectivity) in ancient Egyptian figure drawing."
  },
  {
    "filename": "/images/articles/pharaoh-smiting-enemies-hierarchical-scale.jpg",
    "prompt": "Generate an image depicting a classic Egyptian scene (like the Narmer Palette or a temple relief) demonstrating hierarchical scale. Show a large, dominant figure of the pharaoh smiting much smaller figures representing defeated enemies. Aspect ratio 4:3.",
    "alt_text": "Egyptian artwork demonstrating hierarchical scale, with a large pharaoh and smaller enemies."
  },
  {
    "filename": "/images/articles/egyptian-tomb-painting-registers.jpg",
    "prompt": "Generate an image of a section of an Egyptian tomb wall painting clearly organized into horizontal bands or registers. Each register should contain a distinct part of a narrative or scene, illustrating this common organizational principle in Egyptian art. Aspect ratio 16:9.",
    "alt_text": "Egyptian tomb painting organized into horizontal narrative bands called registers."
  },
  {
    "filename": "/images/articles/egyptian-art-symbolic-colors-relief.jpg",
    "prompt": "Create an image of a well-preserved painted relief carving from ancient Egypt where the symbolic use of colors is evident. For example, show Osiris with green or black skin, men with reddish-brown skin, women with yellow-ochre skin, gods with blue hair. Aspect ratio 4:3.",
    "alt_text": "Painted Egyptian relief illustrating the symbolic use of colors in ancient art."
  },
  {
    "filename": "/images/articles/egyptian-art-style-comparison-amarna.jpg",
    "prompt": "Create a comparison image showing two Egyptian figures side-by-side. One figure should be in the traditional, formal, rigid style. The other figure should be in the more naturalistic, fluid, and potentially exaggerated Amarna style (e.g., Akhenaten or Nefertiti figure). Highlight the stylistic differences. Aspect ratio 16:9.",
    "alt_text": "Comparison showing the difference between traditional Egyptian art style and the Amarna period style."
  },

  // ==================================
  // Article: ancient-egyptian-technology-innovations (ancient-egyptian-technology-innovations-medicine-math-engineering)
  // ==================================
  {
    "filename": "/images/articles/egyptian-technology-montage.jpg",
    "prompt": "Create a montage illustrating various ancient Egyptian technological achievements. Include visual elements representing medicine/surgery (papyri, tools), mathematics/surveying (measuring rope, geometric figures), hydraulic engineering (shaduf, canals), glass/faience making, and writing (papyrus, scribal tools). Aspect ratio 16:9.",
    "alt_text": "Montage showcasing ancient Egyptian innovations in medicine, math, engineering, and crafts."
  },
  {
    "filename": "/images/articles/edwin-smith-papyrus-page.jpg",
    "prompt": "Generate an image showing a section of the ancient Egyptian Edwin Smith Papyrus, known for its remarkably rational descriptions of surgical cases. Show the Hieratic script clearly. Focus on the appearance of the medical text. Aspect ratio 4:3.",
    "alt_text": "Section of the Edwin Smith Papyrus, an ancient Egyptian medical text on surgery."
  },
  {
    "filename": "/images/articles/ancient-egyptian-surgical-tools.jpg",
    "prompt": "Generate a photograph of a collection of ancient Egyptian medical or surgical instruments, likely made of bronze. Include items like scalpels, forceps, probes, and possibly cauterization tools, displayed as artifacts. Museum setting. Aspect ratio 16:9.",
    "alt_text": "Collection of ancient Egyptian bronze surgical instruments."
  },
  {
    "filename": "/images/articles/rhind-mathematical-papyrus-section.jpg",
    "prompt": "Generate an image showing a section of the ancient Egyptian Rhind Mathematical Papyrus. Show the Hieratic script illustrating mathematical problems involving fractions, geometry (area calculations), or practical arithmetic. Aspect ratio 4:3.",
    "alt_text": "Section of the Rhind Mathematical Papyrus showing ancient Egyptian mathematical problems."
  },
  {
    "filename": "/images/articles/egyptian-units-measurement-diagram.png",
    "prompt": "Create a diagram illustrating ancient Egyptian units of measurement. Include the royal cubit (with divisions like palms and digits) and perhaps units of weight like the deben or kite. Use Egyptian motifs in the design. Aspect ratio 16:9.",
    "alt_text": "Diagram illustrating ancient Egyptian units of measurement like the cubit and deben."
  },
  {
    "filename": "/images/articles/shaduf-irrigation-egypt-relief.jpg",
    "prompt": "Generate an image, either in the style of an Egyptian relief/painting OR a realistic reconstruction, depicting farmers using a shaduf (a counterweighted lever device) to lift water from the Nile or a canal to irrigate fields. Aspect ratio 16:9.",
    "alt_text": "Ancient Egyptians using a shaduf device to lift water for irrigation."
  },
  {
    "filename": "/images/articles/ancient-egyptian-canal-system-map.png",
    "prompt": "Create a simplified map or diagram illustrating the concept of ancient Egyptian irrigation systems along the Nile. Show the river, main canals, feeder channels, and basin irrigation areas. Aspect ratio 16:9.",
    "alt_text": "Conceptual map showing ancient Egyptian irrigation canals and basin system along the Nile."
  },
  {
    "filename": "/images/articles/egyptian-core-formed-glass-vessels.jpg",
    "prompt": "Generate a photograph of several examples of ancient Egyptian core-formed glass vessels, such as small amphoriskoi or alabastra. Show the characteristic opaque colored glass (often blue, yellow, white) with trailed zigzag or feather patterns. Museum quality. Aspect ratio 4:3.",
    "alt_text": "Examples of ancient Egyptian core-formed glass vessels with decorative patterns."
  },
  {
    "filename": "/images/articles/egyptian-faience-amulets-tiles.jpg",
    "prompt": "Generate a photograph showcasing various small objects made of vibrant blue-green Egyptian faience. Include items like amulets (scarab, ankh, wadjet), shabti figures, beads, and perhaps inlaid tiles. Aspect ratio 16:9.",
    "alt_text": "Collection of various objects made from vibrant blue-green Egyptian faience."
  },
  {
    "filename": "/images/articles/egyptian-civil-calendar-diagram.png",
    "prompt": "Create a diagram illustrating the ancient Egyptian civil calendar. Show the 365-day year divided into three seasons (Akhet - Inundation, Peret - Growth, Shemu - Harvest), each with four months of 30 days, plus the 5 epagomenal days. Aspect ratio 16:9.",
    "alt_text": "Diagram explaining the structure of the 365-day ancient Egyptian civil calendar."
  },
  {
    "filename": "/images/articles/papyrus-plants-nile.jpg",
    "prompt": "Generate a photograph or realistic illustration of papyrus plants (Cyperus papyrus) growing thickly in a marshy environment along the Nile River delta. Show their tall stems and distinctive feathery heads. Aspect ratio 16:9.",
    "alt_text": "Papyrus plants (Cyperus papyrus) growing in a Nile marsh environment."
  },
  {
    "filename": "/images/articles/writing-on-papyrus-closeup.jpg",
    "prompt": "Generate a close-up photograph showing ancient Egyptian script (Hieratic or Demotic) written in black and red ink on a textured papyrus sheet. Focus on the details of the script and the material. Aspect ratio 4:3.",
    "alt_text": "Close-up view of ancient Egyptian Hieratic or Demotic script written on papyrus."
  },

  // ==================================
  // Article: egyptian-writing-materials (ancient-egyptian-writing-materials-papyrus-ostraca-stone)
  // ==================================
  {
    "filename": "/images/articles/egyptian-scribal-palette-papyrus.jpg",
    "prompt": "Generate a photograph showing an ancient Egyptian scribal palette (wooden or stone) with depressions for black and red ink cakes, reed pens stored in a slot, placed next to a partially rolled or flat sheet of papyrus. Represents the scribe's toolkit. Aspect ratio 4:3.",
    "alt_text": "Ancient Egyptian scribal palette with ink cakes and reed pens alongside a papyrus sheet."
  },
  {
    "filename": "/images/articles/papyrus-making-process-diagram.png",
    "prompt": "Create a series of diagrams illustrating the process of making papyrus sheets in ancient Egypt. Show steps: harvesting papyrus stalks, peeling the rind, slicing the pith into strips, layering strips perpendicularly, pressing, and drying to form a sheet. Aspect ratio 16:9.",
    "alt_text": "Diagram illustrating the step-by-step process of making papyrus writing sheets."
  },
  {
    "filename": "/images/articles/papyrus-scroll-unrolled.jpg",
    "prompt": "Generate a photograph of a long ancient Egyptian papyrus scroll partially unrolled, revealing columns of Hieroglyphic or Hieratic text and possibly vignettes (illustrations), perhaps from the Book of the Dead. Aspect ratio 16:9.",
    "alt_text": "An ancient Egyptian papyrus scroll partially unrolled showing text and illustrations."
  },
  {
    "filename": "/images/articles/ostraca-limestone-pottery-examples.jpg",
    "prompt": "Generate a photograph displaying several ancient Egyptian ostraca - broken shards of limestone and pottery - inscribed with Hieratic or Demotic script or simple drawings. Show the variety of these everyday writing materials. Aspect ratio 16:9.",
    "alt_text": "Collection of ancient Egyptian ostraca (limestone and pottery shards) used for informal writing and sketches."
  },
  {
    "filename": "/images/articles/ostracon-sketch-figure.jpg",
    "prompt": "Generate a close-up photograph of a single ostracon (limestone or pottery shard) featuring a lively sketch of a human figure, animal, or scene, perhaps from Deir el-Medina, showcasing informal Egyptian art. Aspect ratio 1:1 or 4:3.",
    "alt_text": "Ancient Egyptian ostracon featuring a lively sketch, likely from Deir el-Medina."
  },
  {
    "filename": "/images/articles/hieroglyphs-carved-temple-wall.jpg",
    "prompt": "Generate a photograph focusing on deeply carved hieroglyphic inscriptions on a massive stone wall of an ancient Egyptian temple (like Karnak or Edfu). Show the texture of the stone and the three-dimensional quality of the monumental script. Aspect ratio 16:9.",
    "alt_text": "Deeply carved hieroglyphic inscriptions on a stone temple wall in ancient Egypt."
  },
  {
    "filename": "/images/articles/egyptian-stela-inscription.jpg",
    "prompt": "Generate a photograph of a complete ancient Egyptian stela (round-topped stone slab) featuring both carved relief figures and columns of hieroglyphic text. Museum setting. Aspect ratio 3:4.",
    "alt_text": "Ancient Egyptian stone stela featuring carved figures and hieroglyphic inscriptions."
  },
  {
    "filename": "/images/articles/egyptian-writing-board-gesso.jpg",
    "prompt": "Generate a photograph of an ancient Egyptian wooden writing board, possibly covered with a layer of gesso (white plaster), used for temporary writing or practice exercises, perhaps showing traces of ink. Aspect ratio 4:3.",
    "alt_text": "Ancient Egyptian wooden writing board, possibly coated with gesso, used for practice."
  },
  {
    "filename": "/images/articles/egyptian-mummy-label-wood.jpg",
    "prompt": "Generate a photograph of an ancient Egyptian mummy label, typically a small wooden tag inscribed with Hieratic, Demotic, or Greek text identifying the deceased, often with a hole for attachment. Aspect ratio 1:1.",
    "alt_text": "Ancient Egyptian wooden mummy label with inscribed text identifying the deceased."
  },
  {
    "filename": "/images/articles/egyptian-leather-scroll-fragment.jpg",
    "prompt": "Generate a photograph of a fragment of an ancient Egyptian scroll made from leather instead of papyrus, showing visible text. Highlight the texture and different appearance of the leather material. Aspect ratio 4:3.",
    "alt_text": "Fragment of an ancient Egyptian scroll written on durable leather."
  },
  {
    "filename": "/images/articles/egyptian-scribal-palette-reed-pens.jpg",
    "prompt": "Generate a close-up photograph focusing on an ancient Egyptian scribal palette showing the depressions for black and red ink cakes and several reed pens resting in their designated slot or alongside the palette. Aspect ratio 4:3.",
    "alt_text": "Close-up of an ancient Egyptian scribal palette with ink wells and reed pens."
  },

  // ==================================
  // Article: egyptian-beauty-adornment (ancient-egyptian-beauty-jewelry-kohl-perfume-symbolism)
  // ==================================
  {
    "filename": "/images/articles/egyptian-jewelry-broad-collar.jpg",
    "prompt": "Generate a photograph showcasing a stunning ancient Egyptian broad collar (wesekh) necklace. Show intricate beadwork using materials like faience, semi-precious stones (lapis, carnelian, turquoise), and gold elements, arranged in concentric rows. Displayed flat or on a bust. Aspect ratio 4:3.",
    "alt_text": "Ornate ancient Egyptian broad collar (wesekh) necklace made of faience, gold, and gemstones."
  },
  {
    "filename": "/images/articles/tutankhamun-pectoral-jewelry.jpg",
    "prompt": "Generate a photograph of one of the elaborate pectoral necklaces found in Tutankhamun's tomb. Feature iconic motifs like the scarab beetle, vulture, cobra (uraeus), inlaid with colourful stones and glass. Museum quality. Aspect ratio 4:3.",
    "alt_text": "Elaborate pectoral necklace jewelry from Tutankhamun's tomb featuring symbolic motifs."
  },
  {
    "filename": "/images/articles/egyptian-amulet-types-scarab-ankh-wadjet.jpg",
    "prompt": "Generate a photograph displaying a variety of common ancient Egyptian amulets, clearly showing their forms. Include a scarab beetle, ankh (life), djed pillar (stability), and wadjet eye (Eye of Horus - protection). Made of faience or stone. Aspect ratio 16:9.",
    "alt_text": "Collection of common ancient Egyptian amulets: scarab, ankh, djed pillar, and wadjet eye."
  },
  {
    "filename": "/images/articles/ancient-egyptian-kohl-tubes-applicators.jpg",
    "prompt": "Generate a photograph showcasing several ancient Egyptian kohl tubes or pots used for storing eye paint, made from materials like alabaster, faience, or wood. Include one or two thin kohl applicator sticks. Aspect ratio 4:3.",
    "alt_text": "Collection of ancient Egyptian kohl tubes and applicator sticks used for eye makeup."
  },
  {
    "filename": "/images/articles/egyptian-relief-figure-kohl-eyeliner.jpg",
    "prompt": "Generate a close-up image focusing on the eye area of a figure from an ancient Egyptian relief carving or painting. Clearly show the characteristic heavy black kohl eyeliner applied around the eye. Aspect ratio 1:1.",
    "alt_text": "Close-up of an Egyptian figure from art showing characteristic black kohl eyeliner."
  },
  {
    "filename": "/images/articles/egyptian-alabaster-unguent-jars.jpg",
    "prompt": "Generate a photograph of several elegant ancient Egyptian unguent or perfume jars, typically carved from translucent alabaster in various shapes. Museum display. Aspect ratio 4:3.",
    "alt_text": "Collection of elegant ancient Egyptian alabaster jars used for unguents and perfumes."
  },
  {
    "filename": "/images/articles/egyptian-banquet-scene-scent-cones.jpg",
    "prompt": "Generate an image detail from an Egyptian tomb painting depicting a banquet scene where guests (men and women) are shown wearing conical objects made of perfumed fat (scent cones) on top of their wigs. Aspect ratio 4:3.",
    "alt_text": "Detail from Egyptian banquet scene showing guests wearing perfumed scent cones on their wigs."
  },
  {
    "filename": "/images/articles/ancient-egyptian-wig-preserved.jpg",
    "prompt": "Generate a photograph of an actual preserved ancient Egyptian wig, likely made of human hair or plant fibers, styled with intricate braids or curls. Displayed on a stand in a museum. Aspect ratio 3:4.",
    "alt_text": "Photograph of a well-preserved ancient Egyptian wig artifact."
  },
  {
    "filename": "/images/articles/egyptian-wig-styles-relief.jpg",
    "prompt": "Create an image based on Egyptian reliefs or paintings showcasing different elaborate wig styles worn by men and women (nobles, officials) in ancient Egypt. Show variety in length, braiding, and decoration. Aspect ratio 16:9.",
    "alt_text": "Egyptian art illustrating various elaborate wig styles worn in ancient Egypt."
  },
  {
    "filename": "/images/articles/egyptian-clothing-statues-reliefs.jpg",
    "prompt": "Generate a composite image or selection showing typical ancient Egyptian clothing as depicted on statues or reliefs. Include examples of the simple linen kilt worn by men and the sheath dress worn by women, possibly with variations like pleated garments for elites. Aspect ratio 16:9.",
    "alt_text": "Examples from Egyptian art showing typical linen clothing: kilts for men, sheath dresses for women."
  }
]


/**
 * Delay execution for a specified time
 */
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Clean and enhance search query for better Wikimedia Commons results
 */
function enhanceSearchQuery(query: string): string {
  // Remove specific file type mentions
  query = query.replace(/(jpg|jpeg|png|gif)/gi, '');
  
  // Add relevant categories and qualifiers for historical/archaeological content
  const keywords = query.toLowerCase();
  if (keywords.includes('egypt') || keywords.includes('ancient')) {
    query += ' haslicense:any filetype:bitmap category:Ancient_Egyptian';
  }
  
  return query.trim();
}

/**
 * Calculate relevance score based on query terms
 */
function calculateRelevanceScore(query: string, title: string): number {
  const queryTerms = query.toLowerCase().split(' ').filter(term => term.length > 3);
  const titleTerms = title.toLowerCase().split(/[\s-_]+/);
  
  let matchCount = 0;
  let totalWeight = 0;
  
  for (const term of queryTerms) {
    const weight = term.includes('egypt') || term.includes('ancient') ? 2 : 1;
    totalWeight += weight;
    
    if (titleTerms.some(titleTerm => 
      titleTerm.includes(term) || 
      term.includes(titleTerm) ||
      // Check for similar terms
      (term.includes('egypt') && titleTerm.includes('egyptian')) ||
      (term.includes('temple') && titleTerm.includes('tomb'))
    )) {
      matchCount += weight;
    }
  }
  
  return matchCount / totalWeight;
}

/**
 * Fetches images from Wikimedia Commons with enhanced search
 */
async function fetchWikimediaImages(query: string, perPage: number): Promise<ImageSearchResult[]> {
  const enhancedQuery = enhanceSearchQuery(query);
  const searchUrl = new URL('https://commons.wikimedia.org/w/api.php');
  const params = {
    action: 'query',
    list: 'search',
    srsearch: `${enhancedQuery} filetype:bitmap`,
    srnamespace: '6', // File namespace
    format: 'json',
    srlimit: Math.min(perPage * 2, CONFIG.MAX_WIKIMEDIA_BATCH).toString(),
    origin: '*'
  };

  searchUrl.search = new URLSearchParams(params).toString();

  try {
    await delay(CONFIG.RATE_LIMIT_DELAY);
    const searchResponse = await fetch(searchUrl.toString());
    
    if (!searchResponse.ok) {
      console.error('Wikimedia API error:', await searchResponse.text());
      throw new Error(`Wikimedia search API error: ${searchResponse.statusText}`);
    }

    const data = await searchResponse.json();
    if (!data.query?.search) {
      console.log('No results from Wikimedia Commons');
      return [];
    }

    const results = await Promise.all(data.query.search
      .map(async (result: any) => {
        const imageUrl = `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(result.title)}`;
        try {
          const imageResponse = await fetch(imageUrl, { method: 'HEAD' });
          const contentType = imageResponse.headers.get('content-type') || '';
          if (!contentType.startsWith('image/')) {
            return null;
          }
          
          return {
            url: imageUrl,
            width: 1000, // We'll assume these are large enough since they're from Commons
            height: 1000,
            source: 'wikimedia' as const,
            title: result.title,
            relevanceScore: calculateRelevanceScore(query, result.title)
          };
        } catch {
          return null;
        }
      }))
      .then(results => results.filter((r): r is ImageSearchResult => r !== null))
      .then(results => 
        results
          .filter(img => img.relevanceScore >= CONFIG.RELEVANCE_THRESHOLD)
          .sort((a, b) => b.relevanceScore - a.relevanceScore)
          .slice(0, perPage)
      );

    console.log(`Found ${results.length} suitable images from Wikimedia Commons`);
    return results;
  } catch (error) {
    console.error(`Failed to fetch Wikimedia images for query "${query}":`, error);
    return [];
  }
}

/**
 * Fetches images from Pixabay as a fallback
 */
async function fetchPixabayImages(query: string, perPage: number): Promise<ImageSearchResult[]> {
  const url = new URL('https://pixabay.com/api/');
  const params = {
    key: API_KEYS.PIXABAY,
    q: query,
    per_page: Math.min(perPage * 2, 200).toString(), // Pixabay allows max 200 per request
    image_type: 'photo',
    min_width: CONFIG.MIN_IMAGE_WIDTH.toString(),
    min_height: CONFIG.MIN_IMAGE_HEIGHT.toString(),
    safesearch: 'true',
    lang: 'en'
  };
  
  url.search = new URLSearchParams(params).toString();
  
  try {
    await delay(CONFIG.RATE_LIMIT_DELAY);
    const response = await fetch(url.toString());
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Pixabay API error response:', errorText);
      throw new Error(`Pixabay API error: ${response.statusText}`);
    }

    const data = await response.json();
    if (!data.hits) {
      console.log('No results from Pixabay');
      return [];
    }

    const results = data.hits
      .map((hit: any) => ({
        url: hit.largeImageURL,
        width: hit.imageWidth,
        height: hit.imageHeight,
        source: 'pixabay' as const,
        title: hit.tags,
        relevanceScore: calculateRelevanceScore(query, hit.tags)
      }))
      .filter(img => img.relevanceScore >= CONFIG.RELEVANCE_THRESHOLD)
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, perPage);

    console.log(`Found ${results.length} suitable images from Pixabay`);
    return results;
  } catch (error) {
    console.error(`Failed to fetch Pixabay images for query "${query}":`, error);
    return [];
  }
}

/**
 * Fetches images from Unsplash
 */
async function fetchUnsplashImages(query: string, perPage: number): Promise<ImageSearchResult[]> {
  const url = new URL('https://api.unsplash.com/search/photos');
  const params = {
    query,
    per_page: Math.min(perPage * 2, 30).toString(),
    orientation: 'landscape',
    content_filter: 'high'
  };
  
  url.search = new URLSearchParams(params).toString();
  
  try {
    await delay(CONFIG.RATE_LIMIT_DELAY);
    const response = await fetch(url.toString(), {
      headers: {
        'Authorization': `Client-ID ${API_KEYS.UNSPLASH}`
      }
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Unsplash API error response:', errorText);
      throw new Error(`Unsplash API error: ${response.statusText}`);
    }

    const data = await response.json();
    if (!data.results || !data.results.length) {
      console.log('No results from Unsplash');
      return [];
    }

    const results = data.results
      .map((photo: any) => ({
        url: photo.urls.raw + '&w=1200&fit=max',
        width: photo.width,
        height: photo.height,
        source: 'unsplash' as const,
        title: photo.description || photo.alt_description || '',
        relevanceScore: calculateRelevanceScore(query, photo.description || photo.alt_description || '')
      }))
      .filter(img => img.relevanceScore >= CONFIG.RELEVANCE_THRESHOLD)
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, perPage);

    console.log(`Found ${results.length} suitable images from Unsplash`);
    return results;
  } catch (error) {
    console.error(`Failed to fetch Unsplash images for query "${query}":`, error);
    return [];
  }
}

/**
 * Fetches images from all available providers and returns the best matches
 */
async function fetchImagesFromAllSources(query: string, count: number): Promise<ImageSearchResult[]> {
  try {
    // Try Wikimedia Commons first
    console.log(`Searching Wikimedia Commons for "${query}"...`);
    const wikimediaResults = await fetchWikimediaImages(query, count);
    
    // Try Unsplash second
    console.log(`Searching Unsplash for "${query}"...`);
    const unsplashResults = await fetchUnsplashImages(query, count);
    
    // Try Pixabay last
    console.log(`Searching Pixabay for "${query}"...`);
    const pixabayResults = await fetchPixabayImages(query, count);

    // Combine and sort results from all sources
    const allResults = [...wikimediaResults, ...unsplashResults, ...pixabayResults]
      .sort((a, b) => {
        // Prioritize by source first (Wikimedia > Unsplash > Pixabay)
        if (a.source !== b.source) {
          if (a.source === 'wikimedia') return -1;
          if (b.source === 'wikimedia') return 1;
          if (a.source === 'unsplash') return -1;
          if (b.source === 'unsplash') return 1;
        }
        // Then by relevance score
        return b.relevanceScore - a.relevanceScore;
      });

    console.log(`Total images found: ${allResults.length} (Wikimedia: ${wikimediaResults.length}, Unsplash: ${unsplashResults.length}, Pixabay: ${pixabayResults.length})`);
    return allResults.slice(0, count);
  } catch (error) {
    console.error(`Error fetching images for query "${query}":`, error);
    return [];
  }
}

/**
 * Downloads an image from a URL with retries and validation
 */
async function downloadImage(imageUrl: string, savePath: string, attempt = 1): Promise<boolean> {
  try {
    const response = await fetch(imageUrl);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.statusText}`);
    }

    const contentType = response.headers.get('content-type') || '';
    const buffer = Buffer.from(await response.arrayBuffer());

    // Don't validate dimensions for trusted sources
    const skipDimensionCheck = imageUrl.includes('wikimedia.org') || imageUrl.includes('pixabay.com');
    
    if (!skipDimensionCheck) {
      const { width, height } = await getImageDimensions(buffer);
      if (!isValidImage(width, height, contentType)) {
        throw new Error(`Invalid image format or dimensions: ${contentType}, ${width}x${height}`);
      }
    }

    await fs.mkdir(path.dirname(savePath), { recursive: true });
    await fs.writeFile(savePath, buffer);
    console.log(`✓ Successfully saved ${path.basename(savePath)}`);
    return true;
  } catch (error) {
    console.error(`Error downloading ${path.basename(savePath)} (attempt ${attempt}):`, error);
    
    if (attempt < CONFIG.RETRY_ATTEMPTS) {
      console.log(`Retrying download for ${path.basename(savePath)}...`);
      await delay(CONFIG.RETRY_DELAY);
      return downloadImage(imageUrl, savePath, attempt + 1);
    }
    
    return false;
  }
}

/**
 * Downloads a batch of images concurrently while respecting rate limits
 */
async function downloadImageBatch(downloads: { url: string; savePath: string }[]): Promise<void> {
  for (let i = 0; i < downloads.length; i += CONFIG.MAX_CONCURRENT_DOWNLOADS) {
    const batch = downloads.slice(i, i + CONFIG.MAX_CONCURRENT_DOWNLOADS);
    await Promise.all(batch.map(({ url, savePath }) => downloadImage(url, savePath)));
    await delay(CONFIG.RATE_LIMIT_DELAY);
  }
}

/**
 * Main function to process the queryFilenameMap and download images.
 */
async function main(): Promise<void> {
  console.log('Starting image download process...');
  
  const queryToFilenames: { [query: string]: string[] } = {};
  for (const [filename, query] of Object.entries(queryFilenameMap)) {
    if (!queryToFilenames[query]) {
      queryToFilenames[query] = [];
    }
    queryToFilenames[query].push(filename);
  }

  const downloads: { url: string; savePath: string }[] = [];
  
  for (const [query, filenames] of Object.entries(queryToFilenames)) {
    const numImagesNeeded = filenames.length;
    console.log(`\nFetching ${numImagesNeeded} image(s) for query "${query}"...`);
    
    const images = await fetchImagesFromAllSources(query, numImagesNeeded);
    
    if (images.length < numImagesNeeded) {
      console.warn(`⚠ Not enough images for query "${query}": needed ${numImagesNeeded}, got ${images.length}`);
    }

    // Prepare download queue
    for (let i = 0; i < Math.min(images.length, numImagesNeeded); i++) {
      const image = images[i];
      const filename = filenames[i];
      const savePath = path.join('public', filename);
      const dir = path.dirname(savePath);
      
      await fs.mkdir(dir, { recursive: true });
      downloads.push({ url: image.url, savePath });
      
      // Log the source of the image
      console.log(`Found image for "${filename}" from ${image.source} (relevance: ${image.relevanceScore?.toFixed(2)})`);
    }
  }

  console.log(`\nDownloading ${downloads.length} images in batches...`);
  await downloadImageBatch(downloads);
  
  console.log('\n✨ Image download process completed.');
}

// Helper function to get image dimensions (updated implementation)
async function getImageDimensions(buffer: Buffer): Promise<{ width: number; height: number }> {
  try {
    const dimensions = sizeOf(buffer);
    if (!dimensions.width || !dimensions.height) {
      throw new Error('Could not determine image dimensions');
    }
    return {
      width: dimensions.width,
      height: dimensions.height
    };
  } catch (error) {
    console.error('Error getting image dimensions:', error);
    throw error;
  }
}

/**
 * Validates image format and dimensions
 */
function isValidImage(width: number, height: number, contentType?: string): boolean {
  if (contentType && !CONFIG.SUPPORTED_FORMATS.some(format => contentType.toLowerCase().includes(format))) {
    return false;
  }
  return width >= CONFIG.MIN_IMAGE_WIDTH && height >= CONFIG.MIN_IMAGE_HEIGHT;
}

// Run the script
main().catch((error) => console.error('❌ Script failed:', error));