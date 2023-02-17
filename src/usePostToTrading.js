import { useContext } from 'react';
import { StoreContext } from './Store';
import { doFetch } from './Scope.Api';
import { useToaster } from './Toaster';
import { loadLog } from './MasterLog';
import { loadHistory } from './HistoryPanel';
import { reportError } from './Utils';
import { auth_info, column_metadata, master_log, run_column_metadata, run_trading_list, show_all_history, show_exports, show_runs, show_sso, trading_list } from './atoms';
import { useAtomValue, useSetAtom } from 'jotai';

const usePostToTrading = (historic) => {
  const store = useContext(StoreContext);
  const { state, dispatch } = store;
  const showAllHistory = useAtomValue(show_all_history);
  const { selectedSleeve, dt, optimSettings, aggregates } = state;
  const { runTable, selectedRunSettings, runAggregates } = state;
  const addToast = useToaster();
  const auth = useAtomValue(auth_info);
  const showRuns = useAtomValue(show_runs);
  const showExports = useAtomValue(show_exports);
  const showSSO = useAtomValue(show_sso);
  const setLog = useSetAtom(master_log);
  const columnMetadata = useAtomValue(column_metadata);
  const runColumnMetadata = useAtomValue(run_column_metadata);
  const tradingList = useAtomValue(trading_list);
  const runTradingList = useAtomValue(run_trading_list);

  const postToTrading = (onFetched = null) => {
    const aggr = historic ? runAggregates : aggregates;

    doFetch(
      'PostToTrading',
      {
        DataTable: historic ? runTable : dt,
        OptimizerSettings: historic ? selectedRunSettings : optimSettings,
        Aggregates: aggr[0],
        AggregateDeltas: aggr[1],
        BenchmarkAggr: aggr[2],
        ColumnMetadata: historic ? runColumnMetadata : columnMetadata,
        TradingList: historic ? runTradingList : tradingList,
      },
      auth,
      (res) => {
        onFetched && onFetched(res);

        if (res.ok) {
          addToast({
            type: 'success',
            duration: 3000,
            renderCallback: () => {
              return (
                <div>
                  <div>Posted to Aladdin.</div>
                  <div>{`Target name: ${res.data.TargetName}.`}</div>
                  <div>{`Target details count: ${res.data.TargetDetailsCount}.`}</div>
                  <span style={{ fontSize: '12px' }}>{res.data.Filename}</span>
                </div>
              );
            },
          });

          loadLog({ auth, setLog, showRuns, showExports, showSSO, selectedSleeve }, (res) => reportError(addToast, res));
          loadHistory(auth, dispatch, selectedSleeve.Id, showAllHistory, (res) => reportError(addToast, res));
        } else {
          reportError(addToast, res);
        }
      }
    );
  };

  return postToTrading;
};

export default usePostToTrading;
