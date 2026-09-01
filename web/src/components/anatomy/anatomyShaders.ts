export const anatomyVertexShader = /* glsl */ `
  uniform float uTime;
  uniform float uProgress;
  uniform float uSolidMix;
  uniform float uImpulse;
  uniform float uPixelRatio;
  uniform vec2 uPointer;

  attribute vec3 aScatter;
  attribute float aPhase;
  attribute vec3 aColor;

  varying float vAlpha;
  varying float vDepth;
  varying vec3 vColor;

  float easeQuint(float t) {
    return t < 0.5
      ? 16.0 * t * t * t * t * t
      : 1.0 - pow(-2.0 * t + 2.0, 5.0) * 0.5;
  }

  vec3 srgbToLinear(vec3 value) {
    return mix(
      value / 12.92,
      pow((value + 0.055) / 1.055, vec3(2.4)),
      step(vec3(0.04045), value)
    );
  }

  void main() {
    float depart = easeQuint(clamp((uProgress - 0.08) / 0.34, 0.0, 1.0));
    float reform = easeQuint(clamp((uProgress - 0.67) / 0.29, 0.0, 1.0));
    float dispersed = depart * (1.0 - reform);
    float tremor = sin(uTime * 0.82 + aPhase * 31.416) * 0.055 * dispersed;
    float impulse = uImpulse * (0.10 + 0.045 * sin(aPhase * 18.85));

    vec3 radial = normalize(position + vec3(0.0001));
    vec3 transformed = position + aScatter * (dispersed + impulse);
    transformed += radial * tremor;

    float facetAngle = (floor(aPhase * 12.0) - 5.5) * 0.012 * dispersed;
    mat2 facetRotation = mat2(cos(facetAngle), -sin(facetAngle), sin(facetAngle), cos(facetAngle));
    transformed.xz = facetRotation * transformed.xz;

    vec4 mvPosition = modelViewMatrix * vec4(transformed, 1.0);
    vec2 pointerPlane = uPointer * vec2(1.85, 1.15);
    vec2 delta = mvPosition.xy - pointerPlane;
    float influence = smoothstep(1.35, 0.05, length(delta));
    mvPosition.xy += normalize(delta + vec2(0.0001)) * influence * (0.11 + dispersed * 0.16);

    gl_Position = projectionMatrix * mvPosition;
    gl_PointSize = clamp(
      (3.6 + dispersed * 2.1 + influence * 1.8) * uPixelRatio * (9.0 / -mvPosition.z),
      2.0,
      11.0
    ) * mix(1.0, 0.45, uSolidMix);

    vAlpha = (0.95 + dispersed * 0.05 + influence * 0.05) * (1.0 - uSolidMix);
    vDepth = clamp((-mvPosition.z - 8.0) / 10.0, 0.0, 1.0);
    vColor = srgbToLinear(aColor);
  }
`;

export const anatomyFragmentShader = /* glsl */ `
  varying float vAlpha;
  varying float vDepth;
  varying vec3 vColor;

  void main() {
    float radius = length(gl_PointCoord - vec2(0.5));
    float core = 1.0 - smoothstep(0.08, 0.47, radius);
    float halo = 1.0 - smoothstep(0.22, 0.5, radius);
    if (radius > 0.5) discard;

    vec3 color = vColor * mix(0.62, 0.95, 1.0 - vDepth);
    gl_FragColor = vec4(color, (core * 0.94 + halo * 0.06) * vAlpha);
    #include <colorspace_fragment>
  }
`;
