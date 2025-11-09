export async function POST(request: Request) {
  try {
    const { figure } = await request.json()
    if (!figure) {
      return Response.json({ error: "Missing figure" }, { status: 400 })
    }

    // Step 1: Search for the Wikipedia page
    const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(figure)}&format=json&origin=*`
    const searchResponse = await fetch(searchUrl)
    const searchData = await searchResponse.json()

    if (!searchData?.query?.search?.[0]) {
      return Response.json({ url: null })
    }

    const pageTitle = searchData.query.search[0].title

    // Step 2: Get the page image
    const imageUrl = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(pageTitle)}&prop=pageimages&format=json&pithumbsize=300&origin=*`
    const imageResponse = await fetch(imageUrl)
    const imageData = await imageResponse.json()

    const pages = imageData?.query?.pages
    if (!pages) {
      return Response.json({ url: null })
    }

    const pageId = Object.keys(pages)[0]
    const thumbnailUrl = pages[pageId]?.thumbnail?.source || null

    return Response.json({ url: thumbnailUrl })
  } catch (error) {
    console.error("[wikipedia-images] Error:", error)
    return Response.json({ url: null })
  }
}
