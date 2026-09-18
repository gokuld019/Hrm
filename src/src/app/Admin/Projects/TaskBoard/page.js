"use client";
import { useState } from "react";
import { MoreHorizontal, Plus, MessageSquare, Paperclip, ChevronDown, Calendar, Search } from "lucide-react";

const COLUMNS = [
  { id:"todo",      label:"To Do",     color:"#6366f1", dot:"#6366f1" },
  { id:"pending",   label:"Pending",   color:"#f97316", dot:"#f97316" },
  { id:"inprogress",label:"Inprogress",color:"#14b8a6", dot:"#14b8a6" },
  { id:"completed", label:"Completed", color:"#22c55e", dot:"#22c55e" },
  { id:"onhold",    label:"On-hold",   color:"#eab308", dot:"#eab308" },
  { id:"review",    label:"Review",    color:"#a855f7", dot:"#a855f7" },
];

const initCards = {
  todo:[
    { id:1, tag:"Web Layout", priority:"High",   priorityColor:"bg-red-100 text-red-600",    title:"Payment Gateway",             pct:40, due:"18 Apr 2024", comments:14, files:14, avatars:["PG","AL","BV","CD"] },
    { id:2, tag:"Web Layout", priority:"Medium",  priorityColor:"bg-yellow-100 text-yellow-600",title:"Patient appointment booking", pct:20, due:"15 Apr 2024", comments:14, files:14, avatars:["PA","SH","DM","KG"] },
  ],
  pending:[
    { id:3, tag:"Web Layout", priority:"Low",    priorityColor:"bg-green-100 text-green-600",  title:"Patient appointment booking", pct:20, due:"15 Apr 2024", comments:14, files:14, avatars:["PA","BV","CD","AL"] },
    { id:4, tag:"Web Layout", priority:"High",   priorityColor:"bg-red-100 text-red-600",      title:"Payment Gateway",             pct:40, due:"15 Apr 2024", comments:14, files:14, avatars:["PG","SH","KG","DM"] },
  ],
  inprogress:[
    { id:5, tag:"Web Layout", priority:"High",   priorityColor:"bg-red-100 text-red-600",      title:"Doctor Module",               pct:35, due:"20 Apr 2024", comments:14, files:14, avatars:["DM","AL","BV","CD"] },
    { id:6, tag:"Web Layout", priority:"Low",    priorityColor:"bg-green-100 text-green-600",  title:"Inventory and Supplies",      pct:60, due:"21 Apr 2024", comments:14, files:14, avatars:["IS","SH","KG","PA"] },
  ],
  completed:[
    { id:7, tag:"Web Layout", priority:"Medium", priorityColor:"bg-yellow-100 text-yellow-600",title:"Billing and Payments",        pct:100,due:"22 Apr 2024", comments:14, files:14, avatars:["BP","BV","AL","CD"] },
  ],
  onhold:[
    { id:8, tag:"Web Layout", priority:"High",   priorityColor:"bg-red-100 text-red-600",      title:"Patient Feedback",            pct:15, due:"22 Apr 2024", comments:14, files:14, avatars:["PF","DM","SH","KG"] },
    { id:9, tag:"Web Layout", priority:"Low",    priorityColor:"bg-green-100 text-green-600",  title:"Telemedicine Implementation", pct:40, due:"22 Apr 2024", comments:14, files:14, avatars:["TI","PA","BV","AL"] },
  ],
  review:[
    { id:10,tag:"Web Layout", priority:"Medium", priorityColor:"bg-yellow-100 text-yellow-600",title:"Patient Feedback",            pct:100,due:"16 Apr 2024", comments:14, files:14, avatars:["PF","CD","SH","KG"] },
    { id:11,tag:"Web Layout", priority:"High",   priorityColor:"bg-red-100 text-red-600",      title:"Appointment Scheduling",      pct:100,due:"24 Apr 2024", comments:14, files:14, avatars:["AS","DM","AL","BV"] },
  ],
};

const aColors = ["#6366f1","#14b8a6","#f97316","#ec4899","#22c55e","#a855f7"];
const pctColor = (p) => p >= 100 ? "#22c55e" : p >= 60 ? "#6366f1" : p >= 35 ? "#14b8a6" : p >= 20 ? "#f97316" : "#ef4444";

const Avatar = ({ initials, i }) => (
  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-[9px] font-bold border-2 border-white -ml-1.5 first:ml-0`}
    style={{ backgroundColor: aColors[i % aColors.length] }}>
    {initials.slice(0,2)}
  </div>
);

const Card = ({ card }) => (
  <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-3 space-y-2.5 hover:shadow-md transition-shadow">
    <div className="flex items-center justify-between">
      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-indigo-50 text-indigo-600">{card.tag}</span>
      <div className="flex items-center gap-1.5">
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${card.priorityColor}`}>{card.priority}</span>
        <button className="text-gray-300 hover:text-gray-500"><MoreHorizontal size={13} /></button>
      </div>
    </div>
    <p className="text-xs font-semibold text-gray-800">{card.title}</p>
    <div>
      <div className="flex justify-between text-[10px] text-gray-400 mb-1">
        <span>Progress</span>
        <span className="font-semibold">{card.pct}%</span>
      </div>
      <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width:`${card.pct}%`, backgroundColor: pctColor(card.pct) }} />
      </div>
    </div>
    <div className="flex items-center justify-between text-[10px] text-gray-400">
      <span className="flex items-center gap-1"><Calendar size={10} /> Due on : {card.due}</span>
    </div>
    <div className="flex items-center justify-between">
      <div className="flex">
        {card.avatars.map((a, i) => <Avatar key={i} initials={a} i={i} />)}
        <div className="w-6 h-6 rounded-full bg-orange-400 flex items-center justify-center text-white text-[8px] font-bold border-2 border-white -ml-1.5">+{card.avatars.length}</div>
      </div>
      <div className="flex items-center gap-2 text-gray-400">
        <span className="flex items-center gap-0.5 text-[10px]"><MessageSquare size={10} /> {card.comments}</span>
        <span className="flex items-center gap-0.5 text-[10px]"><Paperclip size={10} /> {card.files}</span>
      </div>
    </div>
  </div>
);

export default function TaskBoardPage() {
  const [priority, setPriority] = useState("High");

  const counts = { todo:55, pending:15, completed:40 };

  return (
    <div>
      {/* Board header */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h2 className="text-sm font-bold text-gray-800">Hospital Administration</h2>
            <div className="flex items-center gap-4 mt-1 text-[11px] text-gray-500">
              <span>Total Task : <b className="text-gray-700">{counts.todo}</b></span>
              <span>Pending : <b className="text-orange-500">{counts.pending}</b></span>
              <span>Completed : <b className="text-green-500">{counts.completed}</b></span>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
              {["High","Medium","Low"].map(p => (
                <button key={p} onClick={() => setPriority(p)}
                  className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${priority === p ? "bg-white shadow text-gray-800" : "text-gray-500"}`}>
                  {p}
                </button>
              ))}
            </div>
            <button className="flex items-center gap-1.5 text-xs text-gray-500 border border-gray-200 rounded-lg px-2.5 py-1.5">
              Clients <ChevronDown size={11} />
            </button>
            <button className="flex items-center gap-1.5 text-xs text-gray-500 border border-gray-200 rounded-lg px-2.5 py-1.5">
              <Calendar size={11} /> Created Date
            </button>
            <button className="flex items-center gap-1.5 text-xs text-gray-500 border border-gray-200 rounded-lg px-2.5 py-1.5">
              <Calendar size={11} /> Due Date
            </button>
            <button className="flex items-center gap-1.5 text-xs text-gray-500 border border-gray-200 rounded-lg px-2.5 py-1.5">
              Select Status <ChevronDown size={11} />
            </button>
            <button className="flex items-center gap-1.5 text-xs text-gray-500 border border-gray-200 rounded-lg px-2.5 py-1.5">
              Sort By : Created Date <ChevronDown size={11} />
            </button>
            <div className="flex items-center gap-1.5 border border-gray-200 rounded-lg px-2.5 py-1.5 bg-white">
              <Search size={11} className="text-gray-400" />
              <input placeholder="Search Project" className="text-xs outline-none w-28 text-gray-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Kanban columns */}
      <div className="overflow-x-auto pb-3">
        <div className="flex gap-3 min-w-max">
          {COLUMNS.map(col => (
            <div key={col.id} className="w-56 flex flex-col gap-2">
              {/* Column header */}
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: col.dot }} />
                  <span className="text-xs font-bold text-gray-700">{col.label}</span>
                  <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded font-semibold ml-1">
                    {String(initCards[col.id]?.length ?? 0).padStart(2,"0")}
                  </span>
                </div>
                <button className="text-gray-300 hover:text-gray-500"><MoreHorizontal size={13} /></button>
              </div>

              {/* Cards */}
              <div className="space-y-2">
                {(initCards[col.id] || []).map(card => <Card key={card.id} card={card} />)}
              </div>

              {/* Add task */}
              <button className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-orange-500 px-1 py-2 transition-colors">
                <Plus size={13} /> New Task
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}