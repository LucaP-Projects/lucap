import React from 'react';

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'light' | 'dark';
  color?: string;
  className?: string;
}

const Loading: React.FC<LoadingProps> = ({
  size = 'md',
  variant = 'light',
  color,
  className = ''
}) => {
  // Size mappings
  const sizeMap = {
    sm: {
      wrapper: 'w-32 h-8',
      circle: 'w-3 h-3',
      shadow: 'w-3'
    },
    md: {
      wrapper: 'w-48 h-12',
      circle: 'w-4 h-4',
      shadow: 'w-4'
    },
    lg: {
      wrapper: 'w-64 h-16',
      circle: 'w-5 h-5',
      shadow: 'w-5'
    }
  };

  // Theme variants
  const themeMap = {
    light: {
      dot: color || '#1a1a1a',
      shadow: 'rgba(0, 0, 0, 0.15)'
    },
    dark: {
      dot: color || '#ffffff',
      shadow: 'rgba(0, 0, 0, 0.9)'
    }
  };

  const currentTheme = themeMap[variant];

  return (
    <div
      className={`relative z-10 ${sizeMap[size].wrapper} ${className}`}
      style={
        {
          '--dot-color': currentTheme.dot
        } as React.CSSProperties
      }
    >
      <style>{`
        @keyframes bounce {
          0% {
            top: 60px;
            height: 5px;
            border-radius: 50px 50px 25px 25px;
            transform: scaleX(1.7);
          }
          40% {
            height: 20px;
            border-radius: 50%;
            transform: scaleX(1);
          }
          100% {
            top: 0%;
          }
        }

        @keyframes shadow {
          0% {
            transform: scaleX(1.5);
          }
          40% {
            transform: scaleX(1);
            opacity: .7;
          }
          100% {
            transform: scaleX(.2);
            opacity: .4;
          }
        }

        .loading-circle {
          animation: bounce .5s alternate infinite ease;
        }

        .loading-circle:nth-child(2) {
          animation-delay: .2s;
        }

        .loading-circle:nth-child(3) {
          animation-delay: .3s;
        }

        .loading-shadow {
          animation: shadow .5s alternate infinite ease;
        }

        .loading-shadow:nth-child(4) {
          animation-delay: .2s;
        }

        .loading-shadow:nth-child(5) {
          animation-delay: .3s;
        }
      `}</style>

      <div
        className={`loading-circle ${sizeMap[size].circle} absolute left-[15%] origin-center rounded-full`}
        style={{ backgroundColor: currentTheme.dot }}
      />
      <div
        className={`loading-circle ${sizeMap[size].circle} absolute left-[45%] origin-center rounded-full`}
        style={{ backgroundColor: currentTheme.dot }}
      />
      <div
        className={`loading-circle ${sizeMap[size].circle} absolute right-[15%] origin-center rounded-full`}
        style={{ backgroundColor: currentTheme.dot }}
      />

      <div
        className={`loading-shadow ${sizeMap[size].shadow} absolute left-[15%] top-15.5 z-[-1] h-1 origin-center rounded-full blur-[1px]`}
        style={{ backgroundColor: currentTheme.shadow }}
      />
      <div
        className={`loading-shadow ${sizeMap[size].shadow} absolute left-[45%] top-[62px] z-[-1] h-1 origin-center rounded-full blur-[1px]`}
        style={{ backgroundColor: currentTheme.shadow }}
      />
      <div
        className={`loading-shadow ${sizeMap[size].shadow} absolute right-[15%] top-[62px] z-[-1] h-1 origin-center rounded-full blur-[1px]`}
        style={{ backgroundColor: currentTheme.shadow }}
      />
    </div>
  );
};

export default Loading;
