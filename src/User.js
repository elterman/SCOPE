import SvgUser from './ICONS/SvgUser';
import { useAtomValue } from 'jotai';
import { auth_info } from './atoms';

const User = () => {
  const auth = useAtomValue(auth_info);
  const { user } = auth || {};
  const { avatar, displayName } = user || {};

  return (
    <>
      <div id="user-name" className="user" style={{ marginRight: '60px' }}>
        {displayName}
      </div>
      <div id="user-avatar" className="user" style={{ marginRight: '8px' }}>
        {avatar ? <img src={avatar} alt="user" style={{ width: '32px', borderRadius: '50%' }} /> : <SvgUser width={32} />}
      </div>
    </>
  );
};

export default User;
