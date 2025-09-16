// Applying responsive design to freelancer dashboard headers
// Making all view headers consistent and mobile-friendly

// Template for responsive header:
<header className="bg-white shadow-sm border-b">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-4 gap-4 sm:gap-0">
      <div className="flex items-center space-x-4">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">WorkBridge</h1>
        <Badge variant="secondary" className="text-xs sm:text-sm">Freelancer Dashboard</Badge>
      </div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
        <span className="text-sm text-gray-600 order-last sm:order-first">{user.email}</span>
        <div className="flex space-x-2">
          <Button onClick={() => router.push('/home')} variant="ghost" size="sm" className="text-xs sm:text-sm">Home</Button>
          <Button onClick={handleLogout} variant="outline" size="sm" className="text-xs sm:text-sm">Logout</Button>
        </div>
      </div>
    </div>
  </div>
</header>
<main className="max-w-7xl mx-auto py-4 sm:py-8 px-4 sm:px-6 lg:px-8">