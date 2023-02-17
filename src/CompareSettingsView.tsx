import React, { useEffect, useContext, useState, useRef, useCallback } from 'react';
import { StoreContext } from './Store';
import JsonViewer from './JsonViewer';
import _ from 'lodash';
import { doFetch } from './Scope.Api';
import { SET_COMP_RUN_SETTINGS } from './reducer';
import SvgSpinner from './ICONS/SvgSpinner';
import { COMP_SETTINGS_WIDTH } from './const';
import { useToaster } from './Toaster';
import { overflowWrap, reportError } from './Utils';
import { useAtomValue } from 'jotai';
import { auth_info } from './atoms';

const CompareSettingsView = () => {
  const store = useContext(StoreContext);
  const { state, dispatch } = store;
  const { selectedRun, selectedRunSettings, compareRun, compRunSettings } = state;
  const [fetching, setFetching] = useState(false);
  const addToast = useToaster();
  const l: any = useRef({}).current;
  const auth = useAtomValue(auth_info);

  useEffect(() => {
    l.mounted = true;

    return () => {
      l.mounted = false;
    };
  }, [l]);

  useEffect(overflowWrap);

  const getSetttings = useCallback(
    (rid: number) => {
      setFetching(true);

      doFetch(`GetRunDetails?requestHistoryId=${rid}`, null, auth, (res: any) => {
        if (l.mounted) {
          setFetching(false);
        }

        if (res.ok) {
          compareRun.settings = res.data.OptimizerSettings;
          dispatch({ type: SET_COMP_RUN_SETTINGS, settings: compareRun.settings });
        } else {
          reportError(addToast, res);
        }
      });
    },
    [addToast, auth, compareRun, dispatch, l.mounted]
  );

  useEffect(() => {
    if (compareRun && !compRunSettings) {
      if (compareRun.settings) {
        dispatch({ type: SET_COMP_RUN_SETTINGS, settings: compareRun.settings });
      } else {
        getSetttings(compareRun.Id);
      }
    }
  }, [compRunSettings, compareRun, dispatch, getSetttings]);

  if (!selectedRun || !compareRun) {
    return null;
  }

  if (fetching) {
    return (
      <div className="section" style={{ gridArea: '1/2', width: COMP_SETTINGS_WIDTH + 10 }}>
        <SvgSpinner width={160} style={{ gridArea: '3/1', placeSelf: 'center' }} />
      </div>
    );
  }

  return (
    <div id="comp-settings" className="settings-pane" style={{ width: COMP_SETTINGS_WIDTH }}>
      <div id="settings-viewer" className="root-scroll" style={{ grid: `${compareRun ? 'auto / 1fr 1fr' : 'auto / auto'}` }}>
        {_.isEmpty(selectedRunSettings) ? null : <JsonViewer src={selectedRunSettings} name="Run 1" style={{ width: '260px' }} />}
        {!compareRun || _.isEmpty(compRunSettings) ? null : (
          <JsonViewer src={compRunSettings} name="Run 2" style={{ gridArea: '1/2', width: '260px' }} />
        )}
      </div>
    </div>
  );
};

export default CompareSettingsView;
