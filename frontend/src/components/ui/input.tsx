import React from 'react'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  icon?: React.ReactNode
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, className = '', ...props }, ref) => {
    return (
      <div className="space-y-2">
        {label && (
          <label className="block text-sm font-medium text-gray-300">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            className={`
              w-full px-4 py-3 bg-gray-900/50 border rounded-xl text-white placeholder-gray-500 
              focus:outline-none focus:ring-2 transition-all duration-200
              ${icon ? 'pl-10' : ''}
              ${error 
                ? 'border-red-500/50 focus:ring-red-500/50' 
                : 'border-gray-600/50 focus:ring-orange-500/50 focus:border-orange-500/50'
              }
              ${className}
            `}
            {...props}
          />
        </div>
        {error && (
          <div className="flex items-center space-x-2 text-red-400 text-sm">
            <span>{error}</span>
          </div>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'

export { Input }
export default Input
