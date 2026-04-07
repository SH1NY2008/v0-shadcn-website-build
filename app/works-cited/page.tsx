
import Link from "next/link";
import { curriculum } from "@/lib/curriculum";
import { dependencies, devDependencies } from "../../package.json";

export default function WorksCited() {
  const allTopics = curriculum.flatMap((course) =>
    course.units.flatMap((unit) =>
      unit.topics.map((topic) => ({
        ...topic,
        courseName: course.name,
        unitName: unit.name,
      }))
    )
  );

  const uniqueVideos = Array.from(new Set(allTopics.map((t) => t.videoId)))
    .map((videoId) => {
      return allTopics.find((t) => t.videoId === videoId);
    })
    .filter(Boolean);

  const bookResources = [
    { title: "Calculus Volume 3", publisher: "OpenStax", url: "https://openstax.org/details/books/calculus-volume-3", pdfUrl: "https://openstax.org/books/calculus-volume-3/pages/1-introduction" },
    { title: "Calculus Volume 2", publisher: "OpenStax", url: "https://openstax.org/details/books/calculus-volume-2", pdfUrl: "https://openstax.org/books/calculus-volume-2/pages/1-introduction" },
    { title: "Calculus Volume 1", publisher: "OpenStax", url: "https://openstax.org/details/books/calculus-volume-1", pdfUrl: "https://openstax.org/books/calculus-volume-1/pages/1-introduction" },
    { title: "Precalculus 2e", publisher: "OpenStax", url: "https://openstax.org/details/books/precalculus-2e", pdfUrl: "https://openstax.org/books/precalculus-2e/pages/1-introduction" },
    {
      title: "Algebra and Trigonometry 2e",
      publisher: "OpenStax",
      url: "https://openstax.org/details/books/algebra-and-trigonometry-2e",
      pdfUrl: "https://openstax.org/books/algebra-and-trigonometry-2e/pages/1-introduction"
    },
    { title: "Algebra 1", publisher: "OpenStax", url: "https://openstax.org/books/algebra-1/pages/quick-start", pdfUrl: "https://openstax.org/books/algebra-1/pages/quick-start" },
    {
      title: "Geometry and Trigonometry Textbooks",
      publisher: "University of Minnesota Libraries Publishing",
      url: "https://open.umn.edu/opentextbooks/subjects/geometry-and-trigonometry",
    },
    { title: "Phamily", publisher: "Phamily", url: "https://phamilypharma.com/" },
    { title: "Introductory Statistics 2e", publisher: "OpenStax", url: "https://openstax.org/details/books/introductory-statistics-2e" },
    { title: "University Physics Vol 1", publisher: "OpenStax", url: "https://openstax.org/details/books/university-physics-volume-1" },
    { title: "University Physics Vol 2", publisher: "OpenStax", url: "https://openstax.org/details/books/university-physics-volume-2" },
    { title: "University Physics Vol 3", publisher: "OpenStax", url: "https://openstax.org/details/books/university-physics-volume-3" },
    { title: "Chemistry 2e", publisher: "OpenStax", url: "https://openstax.org/details/books/chemistry-2e" },
    { title: "Biology 2e", publisher: "OpenStax", url: "https://openstax.org/details/books/biology-2e" },
    { title: "Environmental Science", publisher: "OpenStax", url: "https://openstax.org/details/books/introduction-environmental-science" },
    { title: "Think Java", publisher: "Green Tea Press", url: "https://greenteapress.com/wp/think-java-2e/" },
    { title: "CS Principles", publisher: "Code.org", url: "https://studio.code.org/courses/csp" },
    { title: "American History", publisher: "OpenStax", url: "https://openstax.org/details/books/us-history" },
    { title: "World History: Cultures, States & Societies", publisher: "OAPEN", url: "https://library.oapen.org/handle/20.500.12657/25960" },
    { title: "Western Civilization", publisher: "Lumen Learning", url: "https://courses.lumenlearning.com/suny-hccc-worldhistory2/" },
    { title: "American Government 3e", publisher: "OpenStax", url: "https://openstax.org/details/books/american-government-3e" },
    { title: "Comparative Politics", publisher: "University of Minnesota Libraries", url: "https://open.umn.edu/opentextbooks/textbooks/comparative-politics" },
    { title: "Principles of Macroeconomics 3e", publisher: "OpenStax", url: "https://openstax.org/details/books/principles-macroeconomics-3e" },
    { title: "Principles of Microeconomics 3e", publisher: "OpenStax", url: "https://openstax.org/details/books/principles-microeconomics-3e" },
    { title: "Psychology 2e", publisher: "OpenStax", url: "https://openstax.org/details/books/psychology-2e" },
  ];

  const softwareResources = { ...dependencies, ...devDependencies };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <header className="px-4 lg:px-6 h-14 flex items-center bg-white shadow-sm">
        <Link className="flex items-center justify-center" href="/">
          <span className="text-lg font-semibold">Home</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Link className="text-sm font-medium hover:underline underline-offset-4" href="/">
            Home
          </Link>
        </nav>
      </header>
      <main className="flex-1 py-12 md:py-24 lg:py-32">
        <div className="container px-4 md:px-6">
          <h1 className="text-4xl font-extrabold tracking-tighter sm:text-5xl md:text-6xl text-center">
            Works Cited
          </h1>
          <div className="mt-12 space-y-12">
            <section>
              <h2 className="text-3xl font-bold border-b pb-4 mb-6">Websites & Books</h2>
              <ul className="space-y-4">
                {bookResources.map((book, index) => (
                  <li key={index} className="text-lg">
                    <i>{book.title}</i>. {book.publisher}, <a href={book.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{book.url}</a>.
                    {book.pdfUrl && <a href={book.pdfUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline ml-4">[Download PDF]</a>}
                  </li>
                ))}
              </ul>
            </section>

            <section>
              <h2 className="text-3xl font-bold border-b pb-4 mb-6">Software & Frameworks</h2>
              <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-4">
                {Object.entries(softwareResources).map(([name, version]) => (
                  <li key={name} className="text-lg">
                    {name} (version {version})
                  </li>
                ))}
              </ul>
            </section>

            <section>
              <h2 className="text-3xl font-bold border-b pb-4 mb-6">Video Resources</h2>
              <ul className="space-y-4">
                {uniqueVideos.map((topic) => {
                  if (!topic) return null;
                  return (
                    <li key={topic.videoId} className="text-lg">
                      &#34; {topic.name} &#34;. <i>YouTube</i>, <a href={`https://www.youtube.com/watch?v=${topic.videoId}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{`https://www.youtube.com/watch?v=${topic.videoId}`}</a>.
                    </li>
                  );
                })}
              </ul>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
