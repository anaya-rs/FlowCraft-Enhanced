// FlowCraft Typography System
// This file defines consistent typography classes across the entire application
// Using Poppins font family with standardized sizing and spacing

export const typography = {
  // Main Headings - Following exact requirements
  h1: "text-[2.5rem] font-bold leading-[1.4] tracking-[-0.02em]", // 40px, bold
  h2: "text-[2rem] font-semibold leading-[1.5] tracking-[-0.01em]", // 32px, semi-bold
  h3: "text-[1.5rem] font-semibold leading-[1.5] tracking-[-0.01em]", // 24px, semi-bold
  
  // Body Text - Following exact requirements
  body: "text-[1rem] font-normal leading-[1.6] tracking-[0em]", // 16px, regular
  small: "text-[0.875rem] font-normal leading-[1.5] tracking-[0em]", // 14px, regular
  
  // Additional typography variants for UI consistency
  h4: "text-[1.25rem] font-semibold leading-[1.5] tracking-[-0.01em]", // 20px, semi-bold
  h5: "text-[1.125rem] font-medium leading-[1.5] tracking-[0em]", // 18px, medium
  h6: "text-[1rem] font-medium leading-[1.5] tracking-[0em]", // 16px, medium
  
  // Labels and UI Elements
  label: "text-[0.875rem] font-medium leading-[1.5] tracking-[0em]", // 14px, medium
  caption: "text-[0.75rem] font-normal leading-[1.4] tracking-[0em]", // 12px, regular
  
  // Navigation and Buttons
  nav: "text-[1rem] font-semibold leading-[1.5] tracking-[0em]", // 16px, semi-bold
  button: "text-[0.875rem] font-medium leading-[1.5] tracking-[0em]", // 14px, medium
}

// Utility function to get consistent typography classes
export const getTypography = (type: keyof typeof typography) => {
  return typography[type] || ""
}

// Common typography combinations
export const commonTypography = {
  pageTitle: typography.h1,
  sectionTitle: typography.h2,
  subsectionTitle: typography.h3,
  bodyText: typography.body,
  caption: typography.small,
  button: typography.button,
  nav: typography.nav,
  label: typography.label,
}

// Spacing scale utilities (4px, 8px, 12px, 16px, 24px, 32px)
export const spacing = {
  xs: "4px",
  sm: "8px", 
  md: "12px",
  base: "16px",
  lg: "24px",
  xl: "32px",
  "2xl": "48px",
  "3xl": "64px"
}

// Spacing classes for consistent use - using Tailwind's spacing scale
export const spacingClasses = {
  // Section spacing
  section: "py-6 px-4", // py-24 px-16
  sectionLarge: "py-8 px-6", // py-32 px-24
  sectionXLarge: "py-12 px-8", // py-48 px-32
  
  // Card spacing
  card: "p-6", // p-24
  cardCompact: "p-4", // p-16
  cardLarge: "p-8", // p-32
  
  // Button spacing
  button: "px-6 py-3", // px-24 py-12
  buttonCompact: "px-4 py-2", // px-16 py-8
  buttonLarge: "px-8 py-4", // px-32 py-16
  
  // Text spacing
  text: "mb-4", // mb-16
  textLarge: "mb-6", // mb-24
  textXLarge: "mb-8", // mb-32
  
  // Gap spacing
  gap: "gap-4", // gap-16
  gapLarge: "gap-6", // gap-24
  gapXLarge: "gap-8", // gap-32
  
  // Form spacing
  formField: "mb-6", // mb-24
  formGroup: "space-y-4", // space-y-16
  formSection: "space-y-6", // space-y-24
}

// Page Layout System - Consistent structure across all pages
export const pageLayout = {
  // Main page container
  container: "min-h-screen bg-gray-900 text-white",
  
  // Page header section - consistent across all pages
  header: {
    container: "bg-gray-900 border-b border-gray-800 p-6 lg:p-8",
    content: "max-w-7xl mx-auto",
    title: "text-4xl lg:text-5xl font-bold text-white mb-4 lg:mb-6",
    subtitle: "text-lg lg:text-xl text-gray-300 max-w-3xl mb-6 lg:mb-8",
    actions: "flex flex-col sm:flex-row gap-3 lg:gap-4",
    rightActions: "flex items-center space-x-3"
  },
  
  // Main content area
  content: {
    container: "max-w-7xl mx-auto p-6 lg:p-8 bg-gray-900",
    section: "mb-8 lg:mb-12",
    sectionTitle: "text-2xl lg:text-3xl font-semibold text-white mb-4 lg:mb-6",
    card: "bg-gray-800/80 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 lg:p-8",
    cardCompact: "bg-gray-800/80 backdrop-blur-sm border border-gray-700/50 rounded-lg p-4 lg:p-6"
  },
  
  // Grid layouts
  grid: {
    stats: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 lg:gap-6",
    cards: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8",
    form: "grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8"
  },
  
  // Spacing utilities
  spacing: {
    page: "space-y-6 lg:space-y-8",
    section: "space-y-4 lg:space-y-6",
    card: "space-y-4 lg:space-y-6"
  }
}

// Common button styles
export const buttonStyles = {
  primary: "bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl",
  secondary: "bg-gray-700 hover:bg-gray-600 text-white font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl",
  outline: "border border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white transition-all duration-200",
  danger: "bg-red-600 hover:bg-red-700 text-white font-semibold transition-all duration-200"
}
