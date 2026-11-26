import { useId } from 'react'

// An abstract, painted-looking surface for a research card: lit fractal noise,
// blended into the card colour across the whole card. Generated, so no
// photograph is reused; each card gets its own seed.
export default function ResearchArt({ seed, freq }) {
  const id = useId().replace(/[^a-zA-Z0-9_-]/g, '')
  return (
    <svg className="research-art" viewBox="0 0 400 520" preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <filter id={`${id}-paint`} x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency={freq || '0.0016 0.0042'} numOctaves="2" seed={seed} result="noise" />
          <feDiffuseLighting in="noise" surfaceScale="40" lightingColor="#ffffff" result="diffuse">
            <feDistantLight azimuth="235" elevation="34" />
          </feDiffuseLighting>
          <feSpecularLighting in="noise" surfaceScale="40" specularConstant="0.8" specularExponent="24" lightingColor="#ffffff" result="specular">
            <feDistantLight azimuth="235" elevation="44" />
          </feSpecularLighting>
          <feComposite in="specular" in2="diffuse" operator="arithmetic" k1="0" k2="0.75" k3="1" k4="0" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
      </defs>
      <rect width="400" height="520" filter={`url(#${id}-paint)`} />
    </svg>
  )
}
