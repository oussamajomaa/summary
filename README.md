# Summarization
Il s'agit de l'analyse de certains modèles de synthèse de texte utilisés pour améliorer la lecture numérique d'articles scientifiques. Trois modèles de langage pour l'approche de résumé abstrait ont été sélectionnés et testés, dans le but de choisir celui qui résume le mieux le contenu de chaque section de l'article, c'est-à-dire qui est capable d'extraire les informations essentielles et de rendre le sens général de la source. texte de manière cohérente, en générant correctement de nouvelles données à partir du texte original.

## Model
Deux types de résumés sont générés par les scripts de ce référentiel : les bigrammes de mots clés, extraits à l'aide du modèle de langage Keybert, et les résumés abstraits générés par le modèle de transformateurs T5.

## Data
Le corpus sélectionné est composé de 130 articles scientifiques en anglais en libre accès liés aux domaines de la communication et de l'éducation de la revue espagnole "Comunicar: Scientific Journal of Media Education" [https://doi.org/10.3916/comunicar]. Tous les articles suivent la structure IMRaD et sont téléchargeables au format xml directement depuis le site de la revue. Cette revue a été sélectionnée selon ses indexations actives 2022 : elle est représentative des revues nationales bien positionnées dans le quartile (Q1) parmi les revues scientifiques en Sciences Sociales : Communication, Education et Cultural Studies.

## Language Model for summary generation
Trois modèles de langage, basés sur l'approche de résumé abstrait, ont été analysés dans l'étude : BART (Lewis et al., 2019), PEGASUS (Zhang et al., 2020) et T5 (Raffel et al., 2020).

## Interface
https://obtic.sorbonne-universite.fr/summary/
