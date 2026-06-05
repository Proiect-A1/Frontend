function md5(str: string): string {
  const RL = (n: number, c: number) => (n << c) | (n >>> (32 - c));
  const add = (x: number, y: number) => {
    const l = (x & 0xffff) + (y & 0xffff);
    return (((x >> 16) + (y >> 16) + (l >> 16)) << 16) | (l & 0xffff);
  };

  // UTF-8 encode
  const bytes: number[] = [];
  for (let i = 0; i < str.length; i++) {
    const c = str.charCodeAt(i);
    if (c < 128) bytes.push(c);
    else if (c < 2048) bytes.push((c >> 6) | 192, (c & 63) | 128);
    else bytes.push((c >> 12) | 224, ((c >> 6) & 63) | 128, (c & 63) | 128);
  }

  const bitLen = bytes.length * 8;
  bytes.push(0x80);
  while (bytes.length % 64 !== 56) bytes.push(0);
  for (let i = 0; i < 8; i++) bytes.push((bitLen / Math.pow(2, i * 8)) & 0xff);

  const K = [
    0xd76aa478,0xe8c7b756,0x242070db,0xc1bdceee,0xf57c0faf,0x4787c62a,0xa8304613,0xfd469501,
    0x698098d8,0x8b44f7af,0xffff5bb1,0x895cd7be,0x6b901122,0xfd987193,0xa679438e,0x49b40821,
    0xf61e2562,0xc040b340,0x265e5a51,0xe9b6c7aa,0xd62f105d,0x02441453,0xd8a1e681,0xe7d3fbc8,
    0x21e1cde6,0xc33707d6,0xf4d50d87,0x455a14ed,0xa9e3e905,0xfcefa3f8,0x676f02d9,0x8d2a4c8a,
    0xfffa3942,0x8771f681,0x6d9d6122,0xfde5380c,0xa4beea44,0x4bdecfa9,0xf6bb4b60,0xbebfbc70,
    0x289b7ec6,0xeaa127fa,0xd4ef3085,0x04881d05,0xd9d4d039,0xe6db99e5,0x1fa27cf8,0xc4ac5665,
    0xf4292244,0x432aff97,0xab9423a7,0xfc93a039,0x655b59c3,0x8f0ccc92,0xffeff47d,0x85845dd1,
    0x6fa87e4f,0xfe2ce6e0,0xa3014314,0x4e0811a1,0xf7537e82,0xbd3af235,0x2ad7d2bb,0xeb86d391,
  ];
  const S = [
    7,12,17,22,7,12,17,22,7,12,17,22,7,12,17,22,
    5, 9,14,20,5, 9,14,20,5, 9,14,20,5, 9,14,20,
    4,11,16,23,4,11,16,23,4,11,16,23,4,11,16,23,
    6,10,15,21,6,10,15,21,6,10,15,21,6,10,15,21,
  ];

  let a0 = 0x67452301, b0 = 0xefcdab89, c0 = 0x98badcfe, d0 = 0x10325476;

  for (let i = 0; i < bytes.length; i += 64) {
    const M: number[] = [];
    for (let j = 0; j < 16; j++)
      M[j] = bytes[i+j*4] | (bytes[i+j*4+1] << 8) | (bytes[i+j*4+2] << 16) | (bytes[i+j*4+3] << 24);

    let [a, b, c, d] = [a0, b0, c0, d0];

    for (let j = 0; j < 64; j++) {
      let F: number, g: number;
      if      (j < 16) { F = (b & c) | (~b & d);  g = j; }
      else if (j < 32) { F = (d & b) | (~d & c);  g = (5*j + 1) % 16; }
      else if (j < 48) { F = b ^ c ^ d;            g = (3*j + 5) % 16; }
      else             { F = c ^ (b | ~d);          g = (7*j) % 16; }

      F = add(add(add(a, F), M[g]), K[j]);
      a = d; d = c; c = b; b = add(b, RL(F, S[j]));
    }

    a0 = add(a0, a); b0 = add(b0, b); c0 = add(c0, c); d0 = add(d0, d);
  }

  const le = (n: number) => [n,n>>8,n>>16,n>>24].map(b => (b & 0xff).toString(16).padStart(2,'0')).join('');
  return le(a0) + le(b0) + le(c0) + le(d0);
}

export function getGravatarUrl(email: string, size = 80): string {
  const hash = md5(email.trim().toLowerCase());
  return `https://www.gravatar.com/avatar/${hash}?s=${size}&d=404`;
}

export function getDiceBearUrl(email: string): string {
  return `https://api.dicebear.com/9.x/thumbs/svg?seed=${encodeURIComponent(email.trim().toLowerCase())}`;
}
