const follow = ["border-b-4 border-slate-300 inline-block mx-4 my-2 text-xl hover:border-slate-500 text-slate-800"];

export default function Footer() {
  return (
    <div className="text-center py-4 p-4">
      <div>
        <a href="https://twitter.com/AlchemyLearn" target={"_blank"} rel={"noreferrer"} className={follow}>
          Follow @AlchemyLearn
        </a>
        <a href="https://twitter.com/ekoyanu99" target={"_blank"} rel={"noreferrer"} className={follow}>
          Follow me @ekoyanu99
        </a>
      </div>
    </div>
  );
}
