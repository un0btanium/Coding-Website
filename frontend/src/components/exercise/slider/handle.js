import React from 'react';

export function Handle({ handle: { id, value, percent }, getHandleProps }) {
    return (
      <div
        style={{
          left: `${percent}%`,
          position: 'absolute',
          marginLeft: -5,
          marginTop: 5,
          zIndex: 2,
          width: 10,
          height: 30,
          border: 0,
          textAlign: 'center',
          cursor: 'pointer',
          borderRadius: '5px',
          backgroundColor: '#ffffff',
        }}
        {...getHandleProps(id)}
      />
    )
}