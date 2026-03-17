import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

export default function ChatLayout() {
  return (
    <div className="max-chat">
      <Sidebar onCreateNewConversation={() => {}} />
      <Outlet />
    </div>
  );
}
