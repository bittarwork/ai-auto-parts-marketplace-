import { Link } from 'react-router-dom';
import Container from '../components/common/Container';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import {
  AcademicCapIcon,
  UserCircleIcon,
  BookOpenIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';

/**
 * About Us Page
 * Project team information and credentials
 */
export default function AboutUsPage() {
  const teamMembers = [
    {
      name: 'Abdullah Almonther Bin Othman',
      studentId: '23511844',
      role: 'Final Year Project',
      supervisor: 'Basil Kasasbeh',
    },
    {
      name: 'Faisal Nasser Saleh',
      studentId: '9101813830',
      role: 'Final Year Project',
      supervisor: 'Basil Kasasbeh',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg py-12">
      <Container>
        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            About Us
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Chinese Auto Parts — An intelligent e-commerce platform for auto parts with AI-powered search and vehicle compatibility verification.
          </p>
        </div>

        {/* Project Info */}
        <Card className="mb-8">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 p-3 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
              <BookOpenIcon className="w-8 h-8 text-primary-600 dark:text-primary-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Final Year Project
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                This platform represents a Final Year Project developed by the team below, under academic supervision, 
                combining modern web technologies with AI capabilities to enhance the auto parts shopping experience.
              </p>
            </div>
          </div>
        </Card>

        {/* Team Section */}
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
          <AcademicCapIcon className="w-7 h-7 text-primary-500" />
          Project Team
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          {teamMembers.map((member, index) => (
            <Card key={index} className="overflow-hidden" hover>
              <div className="flex flex-col sm:flex-row gap-6 p-6">
                <div className="flex-shrink-0">
                  <div className="w-20 h-20 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                    <UserCircleIcon className="w-12 h-12 text-primary-600 dark:text-primary-400" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {member.name}
                  </h3>
                  <dl className="space-y-1.5 text-sm">
                    <div className="flex flex-wrap gap-2">
                      <dt className="text-gray-500 dark:text-gray-400">Student ID:</dt>
                      <dd className="font-medium text-gray-900 dark:text-white">{member.studentId}</dd>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <dt className="text-gray-500 dark:text-gray-400">Role:</dt>
                      <dd className="font-medium text-gray-900 dark:text-white">{member.role}</dd>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <dt className="text-gray-500 dark:text-gray-400">Supervisor:</dt>
                      <dd className="font-medium text-primary-600 dark:text-primary-400">{member.supervisor}</dd>
                    </div>
                  </dl>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center">
          <Link to="/">
            <Button variant="primary" size="lg" rightIcon={<ChevronRightIcon className="w-5 h-5" />}>
              Back to Home
            </Button>
          </Link>
        </div>
      </Container>
    </div>
  );
}
