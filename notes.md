
Wikipedia files are located at:
`https://en.wikipedia.org/wiki/[fileurl]`


Get images from a page (example with "Albert Einstein"):
`https://en.wikipedia.org/w/api.php?action=query&titles=Albert%20Einstein&format=json&prop=images`
* note that can substitute %20 with space.

`https://en.wikipedia.org/w/api.php?action=query&titles=List_of_dog_breeds&format=json&prop=iwlinks`
//iwlinks = inter-wiki links


https://en.wikipedia.org/w/api.php?action=parse&page=List_of_dog_breeds&format=json
https://en.wikipedia.org/w/api.php?action=parse&page=List_of_dog_breeds&format=json&prop=links
https://en.wikipedia.org/w/api.php?action=parse&page=List_of_dog_breeds&format=json&section=1

got dog breeds json with this query:
https://en.wikipedia.org/w/api.php?action=parse&page=List_of_dog_breeds&format=json&section=1&prop=links

sections:
1 "A–C"
2 "D-K"
3 "L-R"
4 "S-Z"

get images from a webpage:
  https://en.wikipedia.org/w/api.php?action=parse&page=Pet_door&format=json&prop=images
  |–>   https://en.wikipedia.org/w/api.php?action=parse&page=[page-name]&format=json&prop=images

go to the image page from its wikipedia name:
  https://commons.wikimedia.org/wiki/File:[Name of File]

get article image:
  https://en.wikipedia.org/w/api.php?action=query&prop=pageimages&format=json&piprop=original&titles=[NAME]


TODO:
// show "now image" if no image for dog (ex: "Combai", "Villanuco de Las Encartaciones")

Fun names: "Grand Anglo-Français Tricolore" "Schweizerischer Niederlaufhund" "Small Münsterländer (423) "

PROBLEM: Image wasn't rendered for these dogs:
  "Český fousek"
  "Bichon Frisé (61)"
  "Cão Fila de São Miguel (141) "
