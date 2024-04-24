import React, { useEffect, useState } from 'react';
import * as ECT from '@whoicd/icd11ect';
import '@whoicd/icd11ect/style.css';

const ECTReactComponent = (props) => {
  const [iNo] = useState(1);

  useEffect(() => {
    const settings = {
      apiServerUrl: 'https://id.who.int',
      apiSecured: true,
      autoBind: false,
    };
    const callbacks = {
      selectedEntityFunction: (selectedEntity) => {
        props.handleSelectProblem(selectedEntity);
        ECT.Handler.clear(iNo);
      },

      getNewTokenFunction: async () => {
        try {
          return await props.getToken();
        } catch (e) {
          console.log('Error during the request');
        }
      },
    };
    ECT.Handler.configure(settings, callbacks);
    ECT.Handler.bind(iNo);
  }, [iNo, props]);

  useEffect(() => {
    if (props.value) {
      ECT.Handler.search(iNo, props.value);
    }
  }, [props.value]);

  return (
    <div>
      <input
        type="text"
        className="ctw-input"
        autoComplete="off"
        data-ctw-ino={iNo}
        style={{ visibility: 'hidden' }}
      />
      <div
        className="ctw-window"
        data-ctw-ino={iNo}
      ></div>
    </div>
  );
};

export default ECTReactComponent;
