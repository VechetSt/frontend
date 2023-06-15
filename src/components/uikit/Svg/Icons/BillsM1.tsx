import React from 'react'
import { SvgProps, rotation } from './types'

const BillsM1: React.FC<SvgProps> = ({ direction = 'down', color = 'text', width, getStyles }) => {
  const deg: rotation = {
    left: 90,
    up: 180,
    right: 270,
    down: 0,
  }
  const style = getStyles({
    degree: deg[direction as keyof rotation],
    color,
  })

  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={width || '48'} viewBox="0 0 48 48" sx={style}>
      <rect
        x="1"
        y="1.48901"
        width="45.2941"
        height="45.2941"
        rx="22.6471"
        sx={{ fill: 'white4' }}
        stroke={color}
        strokeWidth="2"
      />
      <g clipPath="url(#clip0_993_35738)">
        <path
          d="M25.282 12.6793L26.8351 14.276C27.2145 14.6666 27.7481 14.8633 28.2862 14.8112L30.4891 14.5993C31.4881 14.5032 32.3719 15.2539 32.4517 16.2678L32.6281 18.5021C32.6715 19.0481 32.9552 19.5466 33.4002 19.8573L35.2219 21.1289C36.0481 21.7063 36.2484 22.8567 35.6669 23.6856L34.3842 25.5122C34.0704 25.9585 33.972 26.5252 34.1156 27.0532L34.7042 29.2139C34.971 30.1946 34.3948 31.2066 33.4233 31.4617L31.2816 32.0257C30.7577 32.164 30.3233 32.533 30.0981 33.0315L29.178 35.07C28.7605 35.995 27.6763 36.3946 26.7704 35.9582L24.7723 34.9955C24.2839 34.7602 23.7165 34.7602 23.2281 34.9955L21.23 35.9582C20.3232 36.3946 19.239 35.995 18.8224 35.07L17.9022 33.0315C17.6771 32.533 17.2427 32.164 16.7188 32.0257L14.5771 31.4617C13.6056 31.2058 13.0285 30.1937 13.2962 29.2139L13.8848 27.0532C14.0284 26.5252 13.93 25.9585 13.6162 25.5122L12.3335 23.6856C11.752 22.8567 11.9523 21.7063 12.7785 21.1289L14.6002 19.8573C15.0461 19.5466 15.3297 19.0481 15.3723 18.5021L15.5487 16.2678C15.6285 15.2539 16.5123 14.5032 17.5113 14.5993L19.7142 14.8112C20.2531 14.8633 20.7859 14.6666 21.1653 14.276L22.7193 12.6793C23.424 11.9546 24.5773 11.9546 25.282 12.6793Z"
          fill={color}
        />
        <path
          d="M20.5449 24.4341C20.1603 24.4341 19.8255 24.3975 19.5416 24.3232C19.2577 24.249 18.9931 24.1198 18.7479 23.9347C18.2493 23.5559 18 22.8209 18 21.7296C18 20.6384 18.2625 19.9539 18.7866 19.5934C19.2323 19.2877 19.8184 19.136 20.5439 19.136C21.2694 19.136 21.8504 19.2888 22.3144 19.5934C22.8395 19.9539 23.101 20.6663 23.101 21.7296C23.101 22.7929 22.8517 23.5656 22.3531 23.9347C21.8982 24.2673 21.2948 24.4341 20.5429 24.4341H20.5449ZM20.5449 23.0888C20.6151 23.0888 20.6711 23.0609 20.7158 23.006C20.8298 22.8768 20.8868 22.5486 20.8868 22.0213C20.8868 21.4939 20.8695 21.1313 20.8339 20.9322C20.7993 20.7331 20.7596 20.6114 20.7158 20.5641C20.6721 20.5178 20.6151 20.4952 20.5449 20.4952C20.317 20.4952 20.204 20.9278 20.204 21.792C20.204 22.6562 20.318 23.0888 20.5449 23.0888V23.0888ZM22.2371 28.8379C22.0539 28.9444 21.7476 28.9972 21.3193 28.9972C20.8909 28.9972 20.6762 28.8766 20.6762 28.6366C20.6762 28.6183 20.6843 28.5807 20.7026 28.5258L25.3457 19.842C25.4241 19.6945 25.4963 19.5805 25.5625 19.5019C25.6276 19.4233 25.7476 19.3448 25.9227 19.2662C26.0977 19.1876 26.3165 19.1478 26.578 19.1478C27.1203 19.1478 27.391 19.2727 27.391 19.5223C27.391 19.5686 27.3818 19.6106 27.3645 19.6472L22.6695 28.3859C22.5647 28.5796 22.4202 28.7303 22.2371 28.8368V28.8379ZM27.4439 29.136C27.0593 29.136 26.7245 29.0994 26.4406 29.0251C26.1567 28.9509 25.8921 28.8217 25.6469 28.6366C25.1483 28.2578 24.899 27.5228 24.899 26.4315C24.899 25.3402 25.1615 24.6612 25.6856 24.3093C26.1313 23.995 26.7174 23.8379 27.4429 23.8379C28.1684 23.8379 28.7494 23.995 29.2134 24.3093C29.7385 24.6612 30 25.3682 30 26.4315C30 27.4948 29.7507 28.2675 29.2521 28.6366C28.7973 28.9692 28.1938 29.136 27.4419 29.136H27.4439ZM27.4439 27.7907C27.5141 27.7907 27.5701 27.7681 27.6149 27.7219C27.7288 27.583 27.7858 27.2505 27.7858 26.7232C27.7858 26.1958 27.7685 25.8331 27.7329 25.634C27.6983 25.435 27.6586 25.3123 27.6149 25.266C27.5711 25.2197 27.5141 25.1971 27.4439 25.1971C27.216 25.1971 27.103 25.6297 27.103 26.4939C27.103 27.3581 27.217 27.7907 27.4439 27.7907V27.7907Z"
          sx={{ color: 'white4' }}
        />
      </g>
      <defs>
        <clipPath id="clip0_993_35738">
          <rect width="24" height="24" transform="translate(12 12.136)" />
        </clipPath>
      </defs>
    </svg>
  )
}

export default BillsM1
