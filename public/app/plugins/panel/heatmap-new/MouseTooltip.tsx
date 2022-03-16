import React, { useEffect, useState } from 'react';

type Props = {
  visible: boolean;
  offsetX: number;
  offsetY: number;
  children: object;
  className?: string;
  style?: object;
};

type CursorPosState = {
  xPosition: number;
  yPosition: number;
};

export const MouseTooltip = ({ visible = true, offsetX, offsetY, children, className, style }: Props) => {
  const [cursorPos, setCursorPos] = useState<CursorPosState>({ xPosition: 0, yPosition: 0 });
  const [mouseMoved, setMouseMoved] = useState(false);
  const [listenerActive, setListenerActive] = useState(false);

  useEffect(() => {
    addListener();
  });

  useEffect(() => {
    updateListener();
  });

  useEffect(() => {
    return () => {
      removeListener();
    };
  });

  const getTooltipPosition = (event: any) => {
    setCursorPos({ xPosition: event.clientX, yPosition: event.clientY });
    setMouseMoved(true);
  };

  const addListener = () => {
    window.addEventListener('mousemove', getTooltipPosition);
    setListenerActive(true);
  };

  const removeListener = () => {
    window.removeEventListener('mousemove', getTooltipPosition);
    setListenerActive(false);
  };

  const updateListener = () => {
    if (!listenerActive && visible) {
      addListener();
    }

    if (listenerActive && !visible) {
      removeListener();
    }
  };

  return (
    <div
      className={className}
      style={{
        display: visible && mouseMoved ? 'block' : 'none',
        position: 'fixed',
        top: cursorPos.yPosition + offsetY,
        left: cursorPos.xPosition + offsetX,
      }}
    >
      {children}
    </div>
  );
};
