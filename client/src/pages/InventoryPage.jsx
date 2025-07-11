"use client"

import { useState, useEffect } from "react"
import { Package, Shirt, Home, Gamepad2, ShoppingCart, Filter, Loader2 } from "lucide-react"
import InventoryCard from "../components/InventoryCard"
import InventoryTable from "../components/InventoryTable"
import instance from "../axiosConfig"

const InventoryPage = () => {
  const [categories, setCategories] = useState([])
  const [expandedCategory, setExpandedCategory] = useState(null)
  const [conditionFilter, setConditionFilter] = useState("all")
  const [routeFilter, setRouteFilter] = useState("all")
  const [loading, setLoading] = useState(true)
  const [categoryItems, setCategoryItems] = useState({})
  const [loadingItems, setLoadingItems] = useState({})

  // Category icons mapping
  const categoryIcons = {
    electronics: Package,
    clothing: Shirt,
    "home-kitchen": Home,
    toys: Gamepad2,
    groceries: ShoppingCart,
  }

  // Category colors mapping
  const categoryColors = {
    electronics: "from-blue-500 to-blue-600",
    clothing: "from-pink-500 to-pink-600",
    "home-kitchen": "from-green-500 to-green-600",
    toys: "from-yellow-500 to-yellow-600",
    groceries: "from-orange-500 to-orange-600",
  }

  // Fetch categories summary on component mount
  useEffect(() => {
    fetchCategoriesSummary()
  }, [])

  const fetchCategoriesSummary = async () => {
    try {
      setLoading(true)
      const response = await instance.get("/api/inventory/categories")
      const categoriesWithIcons = response.data.map((category) => ({
        ...category,
        icon: categoryIcons[category.id] || Package,
        color: categoryColors[category.id] || "from-gray-500 to-gray-600",
      }))
      setCategories(categoriesWithIcons)
    } catch (error) {
      console.error("Error fetching categories:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchCategoryItems = async (categoryId) => {
    try {
      setLoadingItems((prev) => ({ ...prev, [categoryId]: true }))
      const params = new URLSearchParams()
      if (conditionFilter !== "all") params.append("condition", conditionFilter)
      if (routeFilter !== "all") params.append("route", routeFilter)

      const response = await instance.get(`/api/inventory/categories/${categoryId}/items?${params}`)
      setCategoryItems((prev) => ({ ...prev, [categoryId]: response.data }))
    } catch (error) {
      console.error("Error fetching category items:", error)
    } finally {
      setLoadingItems((prev) => ({ ...prev, [categoryId]: false }))
    }
  }

  const handleCategoryClick = (categoryId) => {
    if (expandedCategory === categoryId) {
      setExpandedCategory(null)
    } else {
      setExpandedCategory(categoryId)
      if (!categoryItems[categoryId]) {
        fetchCategoryItems(categoryId)
      }
    }
  }

  // Refetch items when filters change
  useEffect(() => {
    if (expandedCategory) {
      fetchCategoryItems(expandedCategory)
    }
  }, [conditionFilter, routeFilter, expandedCategory])

  const handleUpdateRoute = async (itemId, newRoute) => {
    try {
      await instance.put(`/api/inventory/items/${itemId}/route`, { route: newRoute })
      // Refresh the current category items
      if (expandedCategory) {
        fetchCategoryItems(expandedCategory)
      }
      // Refresh categories summary to update stats
      fetchCategoriesSummary()
    } catch (error) {
      console.error("Error updating route:", error)
      throw error
    }
  }

  const handleMarkProcessed = async (itemId) => {
    try {
      await instance.put(`/api/inventory/items/${itemId}/processed`)
      // Refresh the current category items
      if (expandedCategory) {
        fetchCategoryItems(expandedCategory)
      }
      // Refresh categories summary to update stats
      fetchCategoriesSummary()
    } catch (error) {
      console.error("Error marking as processed:", error)
      throw error
    }
  }

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gray-50 flex items-center justify-center">
//         <div className="flex items-center gap-3">
//           <Loader2 className="w-6 h-6 animate-spin text-purple-600" />
//           <span className="text-gray-600">Loading inventory data...</span>
//         </div>
//       </div>
//     )
//   }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900 flex w-full">GreenLoopX</h1>
            </div>
    
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600">Welcome</span>
                <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                  
                </div>
              </div>
            
          </div>
        </div>
      </header>

      {/* Page Title */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-900 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-white">Inventory Tracker</h1>
          <p className="text-purple-100 mt-2">Monitor and manage returned items across all categories</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="mb-8 bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center gap-4 mb-4">
            <Filter className="w-5 h-5 text-purple-600" />
            <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
          </div>
          <div className="flex flex-wrap gap-4">
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700 mb-2">Condition</label>
              <select
                value={conditionFilter}
                onChange={(e) => setConditionFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="all">All Conditions</option>
                <option value="good">Good</option>
                <option value="moderate">Moderate</option>
                <option value="damaged">Damaged</option>
              </select>
            </div>
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700 mb-2">Route</label>
              <select
                value={routeFilter}
                onChange={(e) => setRouteFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="all">All Routes</option>
                <option value="resale">Resale</option>
                <option value="refurbish">Refurbish</option>
                <option value="donate">Donate</option>
                <option value="recycle">Recycle</option>
              </select>
            </div>
          </div>
        </div>

        {/* Category Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-8">
          {categories.map((category) => (
            <InventoryCard
              key={category.id}
              category={category}
              isExpanded={expandedCategory === category.id}
              onClick={() => handleCategoryClick(category.id)}
            />
          ))}
        </div>

        {/* Expanded Table */}
        {expandedCategory && (
          <div className="mb-8">
            {categories
              .filter((cat) => cat.id === expandedCategory)
              .map((category) => (
                <InventoryTable
                  key={category.id}
                  category={category}
                  items={categoryItems[expandedCategory] || []}
                  //loading={loadingItems[expandedCategory]}
                  onClose={() => setExpandedCategory(null)}
                  onUpdateRoute={handleUpdateRoute}
                  onMarkProcessed={handleMarkProcessed}
                />
              ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default InventoryPage
