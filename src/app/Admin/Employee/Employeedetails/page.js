"use client";

const projects = [
  { name: "World Health",         tasks: 8, completed: 15, deadline: "31 July 2025", lead: "Leona", color: "#3b82f6" },
  { name: "Hospital Administration", tasks: 8, completed: 15, deadline: "31 July 2025", lead: "Leona", color: "#8b5cf6" },
];

export default function EmployeeDetails({ employee, onBack }) {
  const emp = employee || {
    name: "Stephan Peralt", role: "Software Developer", experience: "10+ years",
    clientId: "CLT-0024", team: "UI/UX Design", joinDate: "1st Jan 2023",
    reportOffice: "Doglas Martini", phone: "(163) 2459 315", email: "perralt12@example.com",
    gender: "Male", birthday: "24th July 2000", address: "1861 Bayonne Ave, Manchester, NJ, 08759",
    passport: "QRET4566FGRT", passportExp: "15 May 2029", nationality: "Indian",
    religion: "Christianity", marital: "Yes", spouseEmployed: "No",
    avatar: "SP", avatarBg: "#ec4899",
    about: "As an award winning designer, I deliver exceptional quality work and bring value to your brand! With 10 years of experience and 350+ projects completed worldwide with satisfied customers, I developed the 360° brand approach."
  };

  return (
    <div>
      {onBack && (
        <button onClick={onBack} className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700 mb-4 font-medium">
          ← Back to Employee List
        </button>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left card */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
            {/* Banner */}
            <div className="h-20 bg-gradient-to-r from-orange-400 to-orange-500" />
            <div className="px-5 pb-5 -mt-8">
              <div className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-xl border-4 border-white mb-3" style={{ backgroundColor: emp.avatarBg }}>
                {emp.avatar}
              </div>
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-base font-bold text-gray-800">{emp.name}</h2>
                <span className="text-green-500 text-sm">✔</span>
              </div>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-orange-50 text-orange-500 font-medium">{emp.role}</span>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 font-medium">{emp.experience}</span>
              </div>
              <div className="space-y-2 text-xs text-gray-500">
                {[
                  ["🪪", "Client ID",     emp.clientId],
                  ["👥", "Team",          emp.team],
                  ["📅", "Date Of Join",  emp.joinDate],
                  ["🏢", "Report Office", emp.reportOffice],
                ].map(([ic, lbl, val]) => (
                  <div key={lbl} className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5"><span>{ic}</span>{lbl}</span>
                    <span className="font-medium text-gray-700">{val}</span>
                  </div>
                ))}
              </div>
              <div className="flex gap-2 mt-4">
                <button className="flex-1 py-2 rounded-xl border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-50">✏️ Edit Info</button>
                <button className="flex-1 py-2 rounded-xl bg-orange-500 text-xs font-semibold text-white hover:bg-orange-600">💬 Message</button>
              </div>
            </div>

            {/* Basic Info */}
            <div className="px-5 py-4 border-t border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold text-gray-700">Basic Information</h3>
                <button className="text-gray-400 text-sm">✏️</button>
              </div>
              <div className="space-y-2 text-xs">
                {[["📞","Phone",emp.phone],["📧","Email",emp.email],["⚥","Gender",emp.gender],["🎂","Birthday",emp.birthday],["📍","Address",emp.address]].map(([ic,lbl,val]) => (
                  <div key={lbl} className="flex justify-between gap-2">
                    <span className="flex items-center gap-1.5 text-gray-400 shrink-0"><span>{ic}</span>{lbl}</span>
                    <span className="text-gray-600 text-right">{val}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Personal Info */}
            <div className="px-5 py-4 border-t border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold text-gray-700">Personal Information</h3>
                <button className="text-gray-400 text-sm">✏️</button>
              </div>
              <div className="space-y-2 text-xs">
                {[["🪪","Passport No",emp.passport],["📅","Passport Exp",emp.passportExp],["🌍","Nationality",emp.nationality],["✝️","Religion",emp.religion],["💍","Marital status",emp.marital],["👫","Employment of spouse",emp.spouseEmployed]].map(([ic,lbl,val]) => (
                  <div key={lbl} className="flex justify-between gap-2">
                    <span className="flex items-center gap-1.5 text-gray-400 shrink-0"><span>{ic}</span>{lbl}</span>
                    <span className="text-gray-600 text-right">{val}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right panels */}
        <div className="lg:col-span-2 space-y-4">
          {/* About */}
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-gray-800">About Employee</h3>
              <div className="flex items-center gap-2">
                <button className="text-gray-400 text-sm">✏️</button>
                <button className="text-gray-400 text-sm">▾</button>
              </div>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed">{emp.about}</p>
          </div>

          {/* Info panels */}
          {[["Bank Information"],["Family Information"]].map(([title]) => (
            <div key={title} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-gray-800">{title}</h3>
                <div className="flex items-center gap-2">
                  <button className="text-gray-400 text-sm">✏️</button>
                  <button className="text-gray-400 text-sm">▾</button>
                </div>
              </div>
              <p className="text-xs text-gray-400 mt-2">No information added yet.</p>
            </div>
          ))}

          {/* Education + Experience */}
          <div className="grid grid-cols-2 gap-4">
            {[["Education Details"],["Experience"]].map(([title]) => (
              <div key={title} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-gray-800">{title}</h3>
                  <div className="flex items-center gap-2">
                    <button className="text-gray-400 text-sm">✏️</button>
                    <button className="text-gray-400 text-sm">▾</button>
                  </div>
                </div>
                <p className="text-xs text-gray-400 mt-2">No information added yet.</p>
              </div>
            ))}
          </div>

          {/* Projects */}
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-4 mb-4 border-b border-gray-100">
              <button className="text-xs font-bold text-orange-500 border-b-2 border-orange-500 pb-2">Projects</button>
              <button className="text-xs text-gray-400 pb-2">Assets</button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {projects.map(p => (
                <div key={p.name} className="border border-gray-100 rounded-xl p-4 hover:shadow-sm transition-shadow">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold" style={{ backgroundColor: p.color }}>
                      {p.name[0]}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-800">{p.name}</p>
                      <p className="text-[10px] text-gray-400">{p.tasks} tasks • {p.completed} Completed</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-gray-400">
                    <div><p>Deadline</p><p className="text-gray-600 font-medium">{p.deadline}</p></div>
                    <div className="text-right"><p>Project Lead</p>
                      <div className="flex items-center gap-1 justify-end">
                        <div className="w-4 h-4 rounded-full bg-orange-300 text-[8px] flex items-center justify-center text-white">{p.lead[0]}</div>
                        <span className="text-gray-600 font-medium">{p.lead}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}