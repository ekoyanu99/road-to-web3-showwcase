import Link from "next/link";

export default function HomesComponent() {
  return (
    <div className="min-h-screen bg-gray-300">

      <main className="px-4 py-12 lg:px-8 md:p-12">
        <h1 className="text-4xl font-bold text-center leading-normal text-slate-700 font">
          Yanuarso&apos;s <strong className="italic-bold text-slate-800">Road&nbsp;to&nbsp;Web3</strong> Showcase
        </h1>
        <p className="text-center text-xl mt-6 text-slate-500 max-w-4xl mx-auto leading-relaxed">
          Here&apos;s my works that followed Alchemy&apos;s amazing Web3 tutorial{" "}
          <strong className="italic-bold text-slate-800">Road to Web3</strong> (deprecating, migrating to{" "}
          <a
            href="https://university.alchemy.com"
            target="_blank"
            rel="noreferrer"
            className="border-b-4 border-slate-300 hover:border-slate-500 text-slate-800"
          >
            Alchemy University
          </a>
          , register now!)
        </p>
        <p className="text-center text-xl mt-6 text-slate-500 max-w-4xl mx-auto leading-relaxed">
          Much appreciated and I have learned so much from these tutorials ❤️
        </p>

        <ul className="flex flex-wrap py-8">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
            <li className="w-full sm:w-1/2 lg:w-1/3 p-4" key={i}>
              <Link
                href={`week/${i}`}
                target="_blank"
                rel="noreferrer"
                className="border-b-4 border-slate-300 text-slate-800"
              >
                <img
                  src={`/thumbnails/${i}.png`}
                  className="border border-white border-opacity-30 w-full rounded-lg shadow-lg hover:scale-110 transition"
                />
              </Link>
            </li>
          ))}
        </ul>
      </main>

    </div>
  );
}
