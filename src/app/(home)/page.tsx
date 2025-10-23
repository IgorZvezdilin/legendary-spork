export default function Home() {
  return (
    <div className="flex flex-1 items-center justify-center">
      <div className="flex max-w-[80%] min-w-[80%] flex-col gap-5">
        <h1 className="mt-10 scroll-m-20 text-center text-4xl font-extrabold tracking-tight text-balance">
          🌿 О компании EcoTech Group
        </h1>

        <p className="leading-7 [&:not(:first-child)]:mt-6">
          EcoTech Group — это инновационный холдинг, специализирующийся на устойчивых технологиях,
          экологичной энергетике и цифровой автоматизации производственных процессов. Мы объединяем
          десятки дочерних компаний, работающих в сферах зелёной энергетики, переработки отходов,
          агротеха и умных городских решений.
        </p>
        <p className="leading-7 [&:not(:first-child)]:mt-6">
          Наша миссия — создавать технологии, которые делают промышленность чище, энергию доступнее,
          а города — комфортнее для жизни. EcoTech Group активно сотрудничает с государственными и
          частными партнёрами, внедряя передовые решения в России и за рубежом.
        </p>
      </div>
    </div>
  );
}
