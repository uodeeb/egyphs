```
import fetch from 'node-fetch';
import fs from 'fs/promises';
import path from 'path';
import { Buffer } from 'buffer';
import sizeOf from 'image-size';

// API Keys Configuration
const API_KEYS = {
  PIXABAY: '49902789-c35dea76da0247000eac1fe9d',  // Your Pixabay API key
  UNSPLASH: '5_8pjNJGGNEqDSHMHI0hHokVxbYCPgtO6dkvem6XBvA', // Add your Unsplash access key here
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
```