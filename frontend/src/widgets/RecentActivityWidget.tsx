export default function RecentActivityWidget() {
  const activities = [
    { id: 1, title: "Meeting with ABC Corp", time: "2 hours ago", type: "meeting" },
    { id: 2, title: "Note added to XYZ Inc", time: "4 hours ago", type: "note" },
    { id: 3, title: "Email sent to John Doe", time: "1 day ago", type: "email" },
  ];

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col h-full">
      <h2 className="text-lg font-semibold mb-6 text-gray-900">Recent Activity</h2>
      <div className="flex-1 space-y-6">
        {activities.map((activity) => (
          <div key={activity.id} className="flex gap-4">
            <div className="w-2 h-2 mt-2 rounded-full bg-blue-500 shrink-0"></div>
            <div>
              <p className="text-sm font-medium text-gray-900">{activity.title}</p>
              <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
            </div>
          </div>
        ))}
      </div>
      <button className="mt-4 text-sm text-blue-600 font-medium hover:text-blue-700 self-start">
        View all activity
      </button>
    </div>
  );
}
