export interface YouTubeVideo {
  id: string
  title: string
  description: string
  thumbnail: string
  duration: string
  channelTitle: string
}

// Khan Academy channel ID
const KHAN_ACADEMY_CHANNEL_ID = "UC4a-Gbdw7vOaccHmFo40b9g"

export async function getKhanAcademyVideos(topic: string): Promise<YouTubeVideo[]> {
  try {
    const apiKey = process.env.YOUTUBE_API_KEY

    if (!apiKey) {
      console.log("[v0] YouTube API key not found, using mock data")
      return getMockKhanAcademyVideos(topic)
    }

    const searchQuery = `Khan Academy ${topic}`
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${KHAN_ACADEMY_CHANNEL_ID}&q=${encodeURIComponent(searchQuery)}&type=video&maxResults=6&key=${apiKey}`,
    )

    if (!response.ok) {
      console.log("[v0] YouTube API request failed, using mock data")
      return getMockKhanAcademyVideos(topic)
    }

    const data = await response.json()

    return data.items.map((item: any) => ({
      id: item.id.videoId,
      title: item.snippet.title,
      description: item.snippet.description,
      thumbnail: item.snippet.thumbnails.medium.url,
      duration: "10-15 min",
      channelTitle: item.snippet.channelTitle,
    }))
  } catch (error) {
    console.log("[v0] Error fetching YouTube videos, using mock data:", error)
    return getMockKhanAcademyVideos(topic)
  }
}

function getMockKhanAcademyVideos(topic: string): YouTubeVideo[] {
  const mockVideos = {
    "Algebra 1": [
      {
        id: "NybHckSEQBI",
        title: "Introduction to Algebra - Khan Academy",
        description: "Learn the basics of algebraic expressions and equations",
        thumbnail: "/algebra-introduction.jpg",
        duration: "12:34",
        channelTitle: "Khan Academy",
      },
      {
        id: "WJWXYQDKfMc",
        title: "Solving Linear Equations - Khan Academy",
        description: "Master the fundamentals of solving linear equations",
        thumbnail: "/linear-equations.jpg",
        duration: "15:22",
        channelTitle: "Khan Academy",
      },
      {
        id: "pCJL1qwHLIQ",
        title: "Graphing Linear Functions - Khan Academy",
        description: "Learn how to graph linear functions on the coordinate plane",
        thumbnail: "/graphing-linear-functions.jpg",
        duration: "14:18",
        channelTitle: "Khan Academy",
      },
    ],
    Geometry: [
      {
        id: "JpBGRA6KHGg",
        title: "Introduction to Geometry - Khan Academy",
        description: "Explore points, lines, and angles in geometry",
        thumbnail: "/geometry-basics.png",
        duration: "11:45",
        channelTitle: "Khan Academy",
      },
      {
        id: "uRgYF6VEjfY",
        title: "Triangles and Angles - Khan Academy",
        description: "Understanding triangle properties and angle relationships",
        thumbnail: "/triangles-angles.jpg",
        duration: "13:56",
        channelTitle: "Khan Academy",
      },
      {
        id: "zYx2vyGOdKg",
        title: "Circle Theorems - Khan Academy",
        description: "Master circle properties and theorems",
        thumbnail: "/circle-theorems.jpg",
        duration: "16:30",
        channelTitle: "Khan Academy",
      },
    ],
    "Algebra 2": [
      {
        id: "bj04s-Y92pM",
        title: "Quadratic Functions - Khan Academy",
        description: "Learn about parabolas and quadratic equations",
        thumbnail: "/quadratic-functions.jpg",
        duration: "14:22",
        channelTitle: "Khan Academy",
      },
      {
        id: "szbYxc-q38Q",
        title: "Exponential Functions - Khan Academy",
        description: "Understanding exponential growth and decay",
        thumbnail: "/exponential-functions.jpg",
        duration: "12:48",
        channelTitle: "Khan Academy",
      },
      {
        id: "00-xsJKkDXw",
        title: "Trigonometry Basics - Khan Academy",
        description: "Introduction to sine, cosine, and tangent",
        thumbnail: "/trigonometry-basics.jpg",
        duration: "15:10",
        channelTitle: "Khan Academy",
      },
    ],
    "Pre-Calculus": [
      {
        id: "cPDzRHVmFLE",
        title: "Polynomial Functions - Khan Academy",
        description: "Explore polynomial graphs and end behavior",
        thumbnail: "/polynomial-functions.jpg",
        duration: "13:25",
        channelTitle: "Khan Academy",
      },
      {
        id: "TJv0rGgzWWo",
        title: "Logarithmic Functions - Khan Academy",
        description: "Understanding logs and their properties",
        thumbnail: "/logarithmic-functions.jpg",
        duration: "14:55",
        channelTitle: "Khan Academy",
      },
      {
        id: "a7yGnQjGeYo",
        title: "Unit Circle - Khan Academy",
        description: "Master the unit circle and trig values",
        thumbnail: "/unit-circle.jpg",
        duration: "16:20",
        channelTitle: "Khan Academy",
      },
    ],
    "Calculus 1": [
      {
        id: "WUvTyaaNkzM",
        title: "Introduction to Limits - Khan Academy",
        description: "Understanding the concept of limits in calculus",
        thumbnail: "/calculus-limits.jpg",
        duration: "15:42",
        channelTitle: "Khan Academy",
      },
      {
        id: "S0_qX4VJhMQ",
        title: "Derivatives Introduction - Khan Academy",
        description: "Learn the fundamentals of derivatives",
        thumbnail: "/derivatives-introduction.jpg",
        duration: "14:33",
        channelTitle: "Khan Academy",
      },
      {
        id: "rfG8ce4nNh0",
        title: "Chain Rule - Khan Academy",
        description: "Master the chain rule for composite functions",
        thumbnail: "/chain-rule.jpg",
        duration: "13:18",
        channelTitle: "Khan Academy",
      },
    ],
    "Calculus 2": [
      {
        id: "Gc7C0KFr2r0",
        title: "Integration Techniques - Khan Academy",
        description: "Advanced methods for evaluating integrals",
        thumbnail: "/integration-techniques.jpg",
        duration: "16:45",
        channelTitle: "Khan Academy",
      },
      {
        id: "oq_2VXa3gQ4",
        title: "Sequences and Series - Khan Academy",
        description: "Understanding convergence and divergence",
        thumbnail: "/placeholder.svg?height=180&width=320",
        duration: "15:28",
        channelTitle: "Khan Academy",
      },
      {
        id: "3d6DsjIBzJ4",
        title: "Taylor Series - Khan Academy",
        description: "Learn about Taylor and Maclaurin series",
        thumbnail: "/placeholder.svg?height=180&width=320",
        duration: "17:15",
        channelTitle: "Khan Academy",
      },
    ],
  }

  return mockVideos[topic as keyof typeof mockVideos] || mockVideos["Algebra 1"]
}
