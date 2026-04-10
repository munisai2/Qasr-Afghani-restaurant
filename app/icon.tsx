import { ImageResponse } from 'next/og'

export const runtime = 'edge'

// Image metadata
export const size = {
  width: 512,
  height: 512,
}
export const contentType = 'image/png'

// Image generation
export default function Icon() {
  return new ImageResponse(
    (
      // ImageResponse JSX element
      <div
        style={{
          fontSize: 320,
          background: '#0A0805',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#C9A84C',
          fontFamily: 'serif',
          fontStyle: 'italic',
        }}
      >
        Q
      </div>
    ),
    // ImageResponse options
    {
      ...size,
    }
  )
}
