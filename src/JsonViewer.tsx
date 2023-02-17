import React from 'react';
import ReactJson from 'react-json-view';

const JsonViewer = (props: any) => {
  const { src, name, showTypes, style, onEdit } = props;

  return (
    <ReactJson
      src={src}
      name={name || 'Settings'}
      displayDataTypes={showTypes === undefined ? false : showTypes}
      style={{ gridArea: '1/1', background: 'transparent', fontFamily: 'Roboto', fontSize: '13px', ...style }}
      onEdit={onEdit}
      theme="harmonic"
      collapsed={false}
      enableClipboard={false}
      iconStyle="circle"
    />
  );
};

export default JsonViewer;
