import { ReactNode, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../shared/Button';
import { Sidebar, SidebarToggle } from './Sidebar';
import { UserAccountMenu } from './UserAccountMenu';

interface ManagerLayoutProps {
  children: ReactNode;
}

export function ManagerLayout({ children }: ManagerLayoutProps) {
  const { profile } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const planBadgeColors = {
    free: 'bg-slate-100 text-slate-700',
    pro: 'bg-blue-100 text-blue-700',
    pro_plus: 'bg-violet-100 text-violet-700',
  };

  const currentPlan = profile?.current_plan || 'free';
  const planDisplay = currentPlan === 'pro_plus' ? 'Pro Plus' : currentPlan === 'pro' ? 'Pro' : 'Free';

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar
        mobileOpen={mobileMenuOpen}
        onMobileClose={() => setMobileMenuOpen(false)}
      />

      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <nav className="bg-white border-b border-slate-200 sticky top-0 z-20">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <SidebarToggle onClick={() => setMobileMenuOpen(true)} />

              <div className="flex-1 lg:ml-0 ml-14" />

              <div className="flex items-center space-x-4">
                <div className={`px-3 py-1 rounded-full text-xs font-semibold ${planBadgeColors[currentPlan as keyof typeof planBadgeColors]}`}>
                  {planDisplay}
                </div>

                <Link to="/surveys/new">
                  <Button size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    New Survey
                  </Button>
                </Link>

                <UserAccountMenu />
              </div>
            </div>
          </div>
        </nav>

        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
