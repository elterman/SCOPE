import { SMF_ASSIGNED, SMF_ELIGIBLE, SMF_SUBMITTED } from './const';
import _ from 'lodash';
import { doFetch } from './Scope.Api';
import { reportError } from './Utils';
import { useToaster } from './Toaster';
import { useAtom, useAtomValue } from 'jotai';
import { new_smf_requests, auth_info } from "./atoms";

const useSmfRequests = (data) => {
  const addToast = useToaster();
  const auth = useAtomValue(auth_info);
  const [newSmfRequests, setNewSmfRequests] = useAtom(new_smf_requests);

  const updatePaceIds = (dt, submitted = null, completed = null) => {
    _.each(dt, (row) => {
      if (!_.has(row, 'paceID')) {
        return;
      }

      if (row.paceID === SMF_ASSIGNED) {
        return;
      }

      if (row.paceID === 'Completed') {
        row.paceID = SMF_ASSIGNED;
        // row.paceID = SMF_ELIGIBLE;
        return;
      }

      if (row.paceID === 'Pending') {
        row.paceID = SMF_SUBMITTED;
        return;
      }

      if (row.paceID < 1) {
        if (_.includes(submitted, row.isins)) {
          row.paceID = SMF_SUBMITTED;
        } else if (_.includes(completed, row.isins)) {
          row.paceID = SMF_ASSIGNED;
        } else if (row.optimizedWeight) {
          row.paceID = SMF_ELIGIBLE;
        } else {
          row.paceID = 0;
        }

        return;
      }
    });
  };


  const smfEligible = () => _.map(_.filter(data, row => row.paceID === -1 && row.optimizedWeight), ob => ob.isins);

  const buttonLabel = () => {
    const count = newSmfRequests.length;
    const label = `Submit${count ? ` ${count}` : ''} SMF Request${count > 1 ? 's' : ''}`;
    return label;
  };

  const submitSmfRequest = (onFetched) => {
    doFetch(
      'SetupSmf',
      newSmfRequests,
      auth,
      (res) => {
        onFetched && onFetched(res);

        if (res.ok) {
          updatePaceIds(data, newSmfRequests);
          setNewSmfRequests([]);
        } else {
          reportError(addToast, res);
        }
      }
    );
  };

  return { updatePaceIds, submitSmfRequest, smfEligible, buttonLabel };
};

export default useSmfRequests;


