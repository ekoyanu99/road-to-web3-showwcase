import Link from "next/link";

export default function HomesComponent() {
  return (
    <div className="min-h-screen bg-blue-100">

      <main className="px-4 py-12 lg:px-8 md:p-12">
        <h1 className="text-4xl font-bold text-center leading-normal text-indigo-700 font">
          Yanuarso&apos;s <strong className="italic-bold text-slate-800">Road&nbsp;to&nbsp;Web3</strong> Showcase
        </h1>
        <p className="text-center text-xl mt-6 text-gray-600 max-w-4xl mx-auto leading-relaxed">
          Here&apos;s my works that followed Alchemy&apos;s amazing Web3 tutorial{" "}
          <strong className="italic-bold text-slate-800">Road to Web3</strong> (deprecating, migrating to{" "}
          <a
            href="https://university.alchemy.com"
            target="_blank"
            rel="noreferrer"
            className="border-b-4 border-blue-500 hover:border-blue-700 text-blue-500"
          >
            Alchemy University
          </a>
          , register now!)
        </p>
        <p className="text-center text-xl mt-6 text-gray-600 max-w-4xl mx-auto leading-relaxed">
          Much appreciated and I have learned so much from these tutorials ❤️
        </p>

        <ul className="flex flex-wrap py-8">
          {[1, 2, 3, 4, 5, 6, 8, 9, 10].map((i) => (
            <li className="w-full sm:w-1/2 lg:w-1/3 p-4" key={i}>
              <Link
                href={`week/${i}`}
                target="_blank"
                rel="noreferrer"
                className="border-b-4 border-blue-500 hover:border-blue-700 text-blue-500"
              >
                <img
                  src={`/thumbnails/${i}.png`}
                  className="border border-indigo-300 w-full rounded-lg shadow-md hover:scale-110 transition"
                />
              </Link>
            </li>
          ))}
        </ul>
      </main>

    </div>
  );
}
