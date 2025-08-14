import React from 'react'
import { motion } from 'framer-motion'

interface CardProps {
  children: React.ReactNode
  className?: string
  hover?: boolean
  padding?: 'sm' | 'md' | 'lg'
}

interface CardContentProps {
  children: React.ReactNode
  className?: string
}

interface CardHeaderProps {
  children: React.ReactNode
  className?: string
}

interface CardTitleProps {
  children: React.ReactNode
  className?: string
}

const Card: React.FC<CardProps> = ({
  children,
  className = '',
  hover = false,
  padding = 'md'
}) => {
  const paddingClasses = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  }
  
  const baseClasses = `bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-2xl ${paddingClasses[padding]}`
  const hoverClasses = hover ? 'hover:border-orange-500/30 hover:shadow-lg hover:shadow-orange-500/10' : ''
  
  const classes = `${baseClasses} ${hoverClasses} ${className}`
  
  return (
    <motion.div
      className={classes}
      whileHover={hover ? { y: -2 } : {}}
      transition={{ duration: 0.2 }}
    >
      {children}
    </motion.div>
  )
}

const CardContent: React.FC<CardContentProps> = ({ children, className = '' }) => (
  <div className={`${className}`}>
    {children}
  </div>
)

const CardHeader: React.FC<CardHeaderProps> = ({ children, className = '' }) => (
  <div className={`mb-4 ${className}`}>
    {children}
  </div>
)

const CardTitle: React.FC<CardTitleProps> = ({ children, className = '' }) => (
  <h3 className={`text-lg font-semibold text-white ${className}`}>
    {children}
  </h3>
)

export { Card, CardContent, CardHeader, CardTitle }
export default Card
