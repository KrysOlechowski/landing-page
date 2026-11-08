import type { CSSProperties } from "react";

export function CatMark() {
  return (
    <svg viewBox="0 0 40 45" aria-hidden="true" className="cat-mark">
      <g fill="currentColor">
        <path d="M10 16 9 2l9 6h6l8-6-1 15c1 5-1 10-4 12 4 4 5 8 4 12H7c-1-5 1-9 5-12-4-3-5-8-2-13Z" />
        <path d="M24 37c11 4 14-5 12-13 5 6 5 18-8 19H9v-4Z" />
      </g>
      <g fill="var(--scene-paper)"><ellipse cx="16" cy="15" rx="1.4" ry="1" /><ellipse cx="25" cy="15" rx="1.4" ry="1" /></g>
    </svg>
  );
}

function Bird({ x, y, scale = 1, delay = 0 }: { x: number; y: number; scale?: number; delay?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <g className="bird-drift" style={{ "--delay": `${delay}s` } as CSSProperties}>
        <g className="bird-left"><path d="M0 5C-7-5-16-8-27-4C-14-5-6 0 0 5Z" /></g>
        <g className="bird-right"><path d="M0 5C7-5 16-10 27-8C14-8 6 0 0 5Z" /></g>
      </g>
    </g>
  );
}

export function Sky() {
  return (
    <svg className="sky-art" viewBox="0 0 510 350" fill="none" aria-hidden="true">
      <defs>
        <radialGradient id="sun-wash" cx="40%" cy="42%" r="65%">
          <stop offset="0" stopColor="var(--scene-sun)" stopOpacity=".13" />
          <stop offset="1" stopColor="var(--scene-sun)" stopOpacity=".34" />
        </radialGradient>
      </defs>
      <g stroke="var(--scene-sun)" strokeLinecap="round">
        {Array.from({ length: 30 }, (_, index) => {
          const angle = (index * 12 + 3) * Math.PI / 180;
          const inner = 86;
          const outer = index % 3 === 0 ? 164 : index % 3 === 1 ? 132 : 114;
          return <line key={index} x1={305 + Math.cos(angle) * inner} y1={170 + Math.sin(angle) * inner} x2={305 + Math.cos(angle) * outer} y2={170 + Math.sin(angle) * outer} strokeWidth={index % 3 === 0 ? 1 : 0.7} />;
        })}
        <circle cx="305" cy="170" r="72" fill="url(#sun-wash)" strokeWidth="1.8" />
        <circle cx="306" cy="169" r="70.8" strokeWidth=".5" opacity=".3" />
      </g>
      <g fill="var(--scene-birds)">
        <Bird x={54} y={119} delay={0} />
        <Bird x={108} y={150} scale={0.89} delay={-2.4} />
        <Bird x={158} y={180} scale={0.8} delay={-4.8} />
      </g>
    </svg>
  );
}

function Pine({ x, y, scale = 1 }: { x: number; y: number; scale?: number }) {
  return (
    <g data-scene="tree" transform={`translate(${x} ${y}) scale(${scale})`} stroke="var(--scene-trees)" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d="M0 3V-144M0-144-10-122 0-129 10-122Z" />
      {[0, 1, 2, 3, 4, 5].map((level) => {
        const yy = -121 + level * 17;
        const width = 13 + level * 5;
        return <path key={level} d={`M0 ${yy} Q${-width / 2} ${yy + 6} ${-width} ${yy + 10} Q${-width - 6} ${yy + 17} ${-width + 2} ${yy + 15} L0 ${yy + 8} L${width - 2} ${yy + 15} Q${width + 6} ${yy + 17} ${width} ${yy + 10} Q${width / 2} ${yy + 6} 0 ${yy}`} />;
      })}
      <path d="M-2 0 0-142 2 0" opacity=".5" strokeWidth=".65" />
    </g>
  );
}

function RoundTree({ x, y, scale = 1 }: { x: number; y: number; scale?: number }) {
  return (
    <g data-scene="tree" transform={`translate(${x} ${y}) scale(${scale})`} fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d="M-28-41C-53-34-72-58-61-78-65-95-45-104-30-99-25-132 23-132 29-99 48-104 66-90 61-73 75-54 52-32 30-40 13-18-10-21-28-41Z" fill="var(--scene-paper)" stroke="var(--scene-trees)" strokeWidth="1.7" />
      <g stroke="var(--scene-trees)" strokeWidth=".65" opacity=".65">
        <path d="M-29-99C-9-99-8-84-12-74M29-99C11-99 8-84 12-76M-61-78C-48-90-30-84-28-69M61-73C48-85 33-79 29-67M-28-41C-34-53-29-63-20-66M30-40C34-51 31-59 25-63" />
      </g>
      <g stroke="var(--scene-trees)" strokeWidth="1.8">
        <path d="M0 5V-94M0-66-18-92M0-44-34-70M0-27 29-62M0-27-43-56M0-65 18-85M0-42 29-70" />
        <path d="M-2 4 0-95 2 4" strokeWidth=".6" />
      </g>
      <path d="M-50-82C-62-67-54-51-43-49M-25-110C-12-123 10-119 19-109" stroke="var(--tree-detail)" strokeWidth="1.1" opacity=".7" />
    </g>
  );
}

function LeafTree({ x, y }: { x: number; y: number }) {
  return (
    <g data-scene="tree" transform={`translate(${x} ${y})`} fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d="M0-120C-42-87-46-30 0-23 47-28 40-84 0-120Z" fill="var(--scene-paper)" stroke="var(--scene-trees)" strokeWidth="1.7" />
      <path d="M0 5V-107M0-83-16-97M0-67 22-87M0-49-23-71M0-34 26-57" stroke="var(--scene-trees)" strokeWidth="1.5" />
      <path d="M-7-108C-28-82-33-44-10-31M8-109C29-80 31-52 16-34" stroke="var(--tree-detail)" strokeWidth=".6" opacity=".65" />
      <path d="M-1 0V-67" stroke="var(--scene-trees)" strokeWidth="1.6" />
    </g>
  );
}

function Acacia({ x, y }: { x: number; y: number }) {
  return (
    <g data-scene="tree" transform={`translate(${x} ${y})`} stroke="var(--scene-trees)" strokeWidth="1.7" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d="M0 4V-133M0-37 32-61M0-56-40-82M0-76 27-103M0-100-29-118" />
      {[
        { x: 0, y: -133, w: 35 }, { x: 10, y: -111, w: 42 },
        { x: -32, y: -85, w: 36 }, { x: 29, y: -69, w: 38 },
      ].map((crown, index) => (
        <g key={index} transform={`translate(${crown.x} ${crown.y})`}>
          <path d={`M${-crown.w} 0C${-crown.w - 4}-5-20-8-18-9C-10-24 14-21 22-10C35-10 ${crown.w + 8}-3 ${crown.w} 0Z`} fill="var(--scene-paper)" />
          <path d={`M${-crown.w + 4}-2Q0-8 ${crown.w - 4}-2M-17-9Q2-16 21-9`} strokeWidth=".6" opacity=".65" />
        </g>
      ))}
    </g>
  );
}

function Sprig({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`} fill="none" stroke="var(--scene-plants)" strokeWidth="1.7" strokeLinecap="round">
      <path d="M0 0Q-8-45-2-88M-3-23-21-40M-5-43 17-59M-5-62-19-77" />
      <path d="M-2-88Q-13-101-3-110 7-100-2-88ZM-20-40Q-42-43-37-58-20-55-20-40ZM17-59Q35-63 31-80 17-75 17-59ZM-19-77Q-39-77-33-92-18-89-19-77ZM-4-53Q-19-57-16-69-4-64-4-53ZM-3-28Q15-32 16-45-2-41-3-28Z" />
    </g>
  );
}

function SeedPlant({ x, y }: { x: number; y: number }) {
  const tips = [[-29, -59], [-16, -75], [0, -82], [17, -73], [31, -58], [-21, -51], [22, -43]];
  return (
    <g transform={`translate(${x} ${y})`} stroke="var(--scene-plants)" strokeWidth="1.8" fill="none" strokeLinecap="round">
      <path d="M0 0V-81M0-27-29-56M0-37 31-55M0-45-16-73M0-47 17-71M0-17-21-48M0-18 22-40" />
      {tips.map(([xx, yy], index) => <ellipse key={index} cx={xx} cy={yy} rx="2.6" ry="3.2" fill="var(--scene-paper)" />)}
    </g>
  );
}

function Butterfly({ x, y, scale = 1, delay = 0 }: { x: number; y: number; scale?: number; delay?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <g className="butterfly-float" style={{ "--delay": `${delay}s` } as CSSProperties} fill="var(--scene-butterflies)">
        <path className="butterfly-left" d="M0 0C-11-17-17-5-7 3-14 14-1 15 0 0Z" />
        <path className="butterfly-right" d="M0 0C11-17 17-5 7 3 14 14 1 15 0 0Z" />
        <path d="M-1-4Q0-6 1-4L1 9H-1Z" />
        <path d="M0-4-3-8M0-4 3-8" fill="none" stroke="var(--scene-butterflies)" strokeWidth=".8" />
      </g>
    </g>
  );
}

function Grasses({ x, y, width = 45 }: { x: number; y: number; width?: number }) {
  return (
    <g transform={`translate(${x} ${y})`} stroke="var(--scene-plants)" strokeWidth=".65" fill="none" opacity=".8">
      {Array.from({ length: 22 }, (_, i) => {
        const endX = ((i * 17) % 31) / 31 * width - width / 2;
        const height = 4 + (i * 11) % 17;
        return <path key={i} d={`M0 0Q${endX / 3} ${-height / 2} ${endX} ${-height}`} />;
      })}
    </g>
  );
}

function HillLayer({ d, tone, lines = 11, step = 8, green = false }: { d: string; tone: number; lines?: number; step?: number; green?: boolean }) {
  const color = green ? "var(--hill-accent)" : `var(--hill-${tone})`;
  return (
    <g data-scene="hill" fill="none" strokeLinecap="round">
      <path d={`${d}L1800 460H-100Z`} fill="var(--scene-paper)" />
      <path d={d} stroke={color} strokeWidth="2.4" />
      {Array.from({ length: lines }, (_, i) => (
        <path key={i} d={d} transform={`translate(0 ${(i + 1) * step})`} stroke={green && i === 0 ? color : `var(--hill-${Math.max(0, tone - Math.floor(i / 2))})`} strokeWidth={i < 2 ? 1.05 : 0.7} opacity={Math.max(0.08, 0.88 - i * 0.075)} />
      ))}
    </g>
  );
}

export function Landscape() {
  return (
    <>
      <Sky />
      <svg className="landscape-art" viewBox="0 0 1672 360" fill="none" aria-hidden="true">
        <g stroke="var(--hill-1)" strokeWidth=".75" opacity=".8">
          {Array.from({ length: 9 }, (_, i) => <path key={i} transform={`translate(0 ${i * 6})`} d="M-80 218C30 157 109 229 202 222S310 245 440 205 571 179 674 207 784 195 862 193 984 212 1103 233 1253 200 1352 192 1456 233 1560 211 1669 162 1760 194" />)}
        </g>
        <HillLayer d="M-100 285C80 280 150 253 280 245C440 224 580 253 720 275C870 299 1050 193 1190 222C1290 241 1405 257 1500 229C1600 198 1730 238 1800 260" tone={5} lines={9} step={7} />
        <g className="woodland">
          <Pine x={124} y={215} />
          <RoundTree x={245} y={212} />
          <SeedPlant x={371} y={244} />
          <g stroke="var(--scene-plants)" strokeWidth="1.3" fill="var(--scene-paper)">
            <path d="M286 230C277 213 293 197 307 205 312 188 337 195 338 211 357 210 360 235 343 241Z" />
            <path d="M314 237 309 210M315 237 324 208M315 234 335 218M312 231 296 217" fill="none" strokeWidth=".7" />
          </g>
          <Grasses x={367} y={245} />
          <LeafTree x={1139} y={217} />
          <RoundTree x={1244} y={221} scale={0.9} />
          <Sprig x={1366} y={252} />
          <Acacia x={1460} y={211} />
          <Pine x={1570} y={218} scale={1.03} />
          <Grasses x={1335} y={249} width={57} />
          <Butterfly x={410} y={220} scale={0.64} delay={-1} />
          <Butterfly x={433} y={203} scale={0.64} delay={-2.7} />
          <Butterfly x={435} y={229} scale={0.42} delay={-4.4} />
          <Butterfly x={1293} y={211} scale={0.65} delay={-1.9} />
          <Butterfly x={1317} y={193} scale={0.7} delay={-3.2} />
          <Butterfly x={1326} y={222} scale={0.44} delay={-5} />
        </g>
        <HillLayer d="M-100 300C100 178 200 188 350 242C490 300 540 289 650 280C880 235 1010 315 1180 292C1310 270 1420 180 1560 214C1650 230 1740 278 1800 280" tone={7} lines={12} step={9} />
        <HillLayer d="M-100 390C130 370 270 329 430 280C600 218 690 222 820 260C1000 329 1110 312 1290 270C1400 240 1500 300 1800 370" tone={4} lines={10} step={8} green />
      </svg>
    </>
  );
}
