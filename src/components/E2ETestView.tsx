import React, { useState } from 'react';
import {
  CheckCircle2,
  XCircle,
  Play,
  RotateCcw,
  ShieldCheck,
  ChevronDown,
  ChevronRight,
  Database,
  Lock,
  Layers,
  Terminal,
  Activity,
} from 'lucide-react';
import { E2ETestResponse, TestResultItem, api } from '../api/client';

export const E2ETestView: React.FC<{ onRefreshApp: () => void }> = ({ onRefreshApp }) => {
  const [isRunning, setIsRunning] = useState(false);
  const [testResponse, setTestResponse] = useState<E2ETestResponse | null>(null);
  const [expandedSteps, setExpandedSteps] = useState<Record<number, boolean>>({});
  const [resetMessage, setResetMessage] = useState<string | null>(null);
  const [isResetting, setIsResetting] = useState(false);

  const toggleStep = (step: number) => {
    setExpandedSteps((prev) => ({ ...prev, [step]: !prev[step] }));
  };

  const handleRunTests = async () => {
    setIsRunning(true);
    setResetMessage(null);
    try {
      const res = await api.runE2ETests();
      setTestResponse(res);
      // Auto-expand all steps
      const exp: Record<number, boolean> = {};
      res.results.forEach((r) => {
        exp[r.step] = true;
      });
      setExpandedSteps(exp);
      onRefreshApp();
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsRunning(false);
    }
  };

  const handleResetDatabase = async () => {
    setIsResetting(true);
    try {
      const res = await api.resetSeedData();
      setResetMessage(res.message);
      setTestResponse(null);
      onRefreshApp();
    } catch (err: any) {
      setResetMessage(`Reset failed: ${err.message}`);
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 rounded-2xl p-6 text-white border border-slate-800 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-1">
              <ShieldCheck className="w-4 h-4" />
              <span>Full-Stack Verification Console</span>
            </div>
            <h2 className="text-xl font-bold tracking-tight">End-to-End Workflow Verification Suite</h2>
            <p className="text-xs text-slate-400 mt-1 max-w-xl">
              Executes live tests directly against Node.js, Express, real MongoDB collections, and JWT/bcryptjs authentication.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleResetDatabase}
              disabled={isResetting || isRunning}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-300 rounded-xl text-xs font-semibold transition-colors flex items-center space-x-1.5"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${isResetting ? 'animate-spin' : ''}`} />
              <span>{isResetting ? 'Resetting...' : 'Reset Demo DB'}</span>
            </button>

            <button
              onClick={handleRunTests}
              disabled={isRunning}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center space-x-2"
            >
              <Play className={`w-3.5 h-3.5 ${isRunning ? 'animate-spin' : ''}`} />
              <span>{isRunning ? 'Running Live Suite...' : 'Run All 8 Workflows'}</span>
            </button>
          </div>
        </div>

        {resetMessage && (
          <div className="mt-4 p-2.5 bg-slate-800/80 border border-slate-700 rounded-lg text-xs text-emerald-400 font-mono">
            {resetMessage}
          </div>
        )}
      </div>

      {/* Summary Scorecard if tests have run */}
      {testResponse && (
        <div
          className={`p-4 rounded-xl border flex items-center justify-between ${
            testResponse.allPassed
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-rose-50 border-rose-200 text-rose-900'
          }`}
        >
          <div className="flex items-center space-x-3">
            {testResponse.allPassed ? (
              <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
            ) : (
              <XCircle className="w-6 h-6 text-rose-600 shrink-0" />
            )}
            <div>
              <div className="text-sm font-bold">
                {testResponse.allPassed
                  ? 'All 8 End-to-End Workflow Scenarios Passed Successfully!'
                  : `${testResponse.passedTests}/${testResponse.totalTests} Scenarios Passed`}
              </div>
              <p className="text-xs opacity-80 mt-0.5">
                Verified real database transactions, bcryptjs password hashing, JWT signing, and RBAC barriers.
              </p>
            </div>
          </div>
          <div className="text-right font-mono font-bold text-lg">
            {testResponse.passedTests} / {testResponse.totalTests}
          </div>
        </div>
      )}

      {/* 8 Tests Execution Results List */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Individual Verification Stages (Requirements 1 - 8)
        </h3>

        {[
          {
            step: 1,
            title: '1. HR Creates an Employee',
            description:
              'HR Administrator provisions new user with encrypted password, assigned department, position, and manager reference in MongoDB.',
          },
          {
            step: 2,
            title: '2. Employee Logs In and Marks Attendance',
            description:
              'New employee authenticates with JWT, executes atomic clock-in and clock-out with elapsed duration calculation.',
          },
          {
            step: 3,
            title: '3. Employee Submits a Leave Request',
            description:
              'Employee submits paid/annual leave request with date span and reason, routed with default "pending" status.',
          },
          {
            step: 4,
            title: '4. Assigned Manager Reviews the Request',
            description:
              'Assigned supervisor evaluates request, verifies authorization boundary, and approves with custom notes.',
          },
          {
            step: 5,
            title: '5. Employee Sees Updated Leave Status',
            description:
              'Employee queries leave endpoint and receives real-time approved status along with manager feedback note.',
          },
          {
            step: 6,
            title: '6. HR Publishes Announcement & Employees View It',
            description:
              'HR Admin broadcasts organization notice with role filter; employee reads and acknowledges receipt.',
          },
          {
            step: 7,
            title: '7. Manager Creates Training & Employee Enrolls',
            description:
              'Manager registers a new technical training cohort; employee self-enrolls with automatic seat capacity decrement.',
          },
          {
            step: 8,
            title: '8. Unauthorized Access Prevention (RBAC)',
            description:
              'Enforces 403 Forbidden when employees attempt HR provisioning or when managers review outside direct team.',
          },
        ].map((meta) => {
          const result = testResponse?.results.find((r) => r.step === meta.step);
          const isExpanded = !!expandedSteps[meta.step];

          return (
            <div
              key={meta.step}
              className={`bg-white rounded-xl border transition-all overflow-hidden ${
                result
                  ? result.passed
                    ? 'border-emerald-200 shadow-xs'
                    : 'border-rose-300 shadow-xs'
                  : 'border-slate-200/80 shadow-xs'
              }`}
            >
              <div
                onClick={() => toggleStep(meta.step)}
                className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50/70 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className="shrink-0">
                    {result ? (
                      result.passed ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      ) : (
                        <XCircle className="w-5 h-5 text-rose-600" />
                      )
                    ) : (
                      <div className="w-5 h-5 rounded-full border-2 border-slate-300 flex items-center justify-center text-[10px] font-bold text-slate-400">
                        {meta.step}
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">{meta.title}</div>
                    <p className="text-[11px] text-slate-500 mt-0.5">{meta.description}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  {result && (
                    <span className="text-[11px] font-mono text-slate-400">
                      {result.durationMs}ms
                    </span>
                  )}
                  {result && (
                    <span
                      className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-full border ${
                        result.passed
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-rose-50 text-rose-700 border-rose-200'
                      }`}
                    >
                      {result.passed ? 'PASSED' : 'FAILED'}
                    </span>
                  )}
                  {isExpanded ? (
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  )}
                </div>
              </div>

              {/* Expandable Execution Details */}
              {isExpanded && result && (
                <div className="p-4 bg-slate-50/80 border-t border-slate-100 text-xs space-y-2">
                  <div className="text-slate-700 font-medium">{result.message}</div>
                  {result.details && (
                    <div className="bg-slate-900 text-slate-200 p-3 rounded-lg font-mono text-[11px] overflow-x-auto">
                      <pre>{JSON.stringify(result.details, null, 2)}</pre>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Audit Matrix Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 overflow-hidden shadow-xs mt-6">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center space-x-2">
          <Database className="w-4 h-4 text-indigo-600" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
            StaffSync Architecture Audit: Frontend vs. Backend Status
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/60 text-slate-400 uppercase tracking-wider text-[11px] border-b border-slate-200">
                <th className="py-2.5 px-4 font-bold">Module</th>
                <th className="py-2.5 px-4 font-bold">Frontend State</th>
                <th className="py-2.5 px-4 font-bold">Backend Implementation</th>
                <th className="py-2.5 px-4 font-bold">Persistence Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr>
                <td className="py-2.5 px-4 font-semibold text-slate-900">Auth & Roles</td>
                <td className="py-2.5 px-4 text-slate-600">Simulate role switch & token bearer headers</td>
                <td className="py-2.5 px-4 text-slate-600">JWT sign/verify, bcryptjs hashing, protect & authorize middleware</td>
                <td className="py-2.5 px-4">
                  <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full text-[10px] font-bold border border-emerald-200">
                    Active & Connected
                  </span>
                </td>
              </tr>
              <tr>
                <td className="py-2.5 px-4 font-semibold text-slate-900">Dashboard Metrics</td>
                <td className="py-2.5 px-4 text-slate-600">Dynamic KPI cards, department distribution bar charts</td>
                <td className="py-2.5 px-4 text-slate-600">MongoDB aggregate pipelines ($match, $group) per role</td>
                <td className="py-2.5 px-4">
                  <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full text-[10px] font-bold border border-emerald-200">
                    Active & Connected
                  </span>
                </td>
              </tr>
              <tr>
                <td className="py-2.5 px-4 font-semibold text-slate-900">Employee Directory</td>
                <td className="py-2.5 px-4 text-slate-600">Search, department filter, profile drawers</td>
                <td className="py-2.5 px-4 text-slate-600">MongoDB User collection, manager population, HR creation</td>
                <td className="py-2.5 px-4">
                  <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full text-[10px] font-bold border border-emerald-200">
                    Active & Connected
                  </span>
                </td>
              </tr>
              <tr>
                <td className="py-2.5 px-4 font-semibold text-slate-900">Attendance Clock</td>
                <td className="py-2.5 px-4 text-slate-600">Real-time clock, punch button, history logs</td>
                <td className="py-2.5 px-4 text-slate-600">Atomic daily records (YYYY-MM-DD), duration calculation</td>
                <td className="py-2.5 px-4">
                  <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full text-[10px] font-bold border border-emerald-200">
                    Active & Connected
                  </span>
                </td>
              </tr>
              <tr>
                <td className="py-2.5 px-4 font-semibold text-slate-900">Leave Approvals</td>
                <td className="py-2.5 px-4 text-slate-600">Request modal, manager approval queue & notes</td>
                <td className="py-2.5 px-4 text-slate-600">Leave status mutations, direct-report boundary check</td>
                <td className="py-2.5 px-4">
                  <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full text-[10px] font-bold border border-emerald-200">
                    Active & Connected
                  </span>
                </td>
              </tr>
              <tr>
                <td className="py-2.5 px-4 font-semibold text-slate-900">Notice Board</td>
                <td className="py-2.5 px-4 text-slate-600">Unread notifications count, publish dialog</td>
                <td className="py-2.5 px-4 text-slate-600">Role-targeted announcements, per-user read receipt sets</td>
                <td className="py-2.5 px-4">
                  <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full text-[10px] font-bold border border-emerald-200">
                    Active & Connected
                  </span>
                </td>
              </tr>
              <tr>
                <td className="py-2.5 px-4 font-semibold text-slate-900">Training Courses</td>
                <td className="py-2.5 px-4 text-slate-600">Enrollment buttons, cohort progress indicators</td>
                <td className="py-2.5 px-4 text-slate-600">Capacity verification, user enrollment arrays, course creation</td>
                <td className="py-2.5 px-4">
                  <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full text-[10px] font-bold border border-emerald-200">
                    Active & Connected
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
