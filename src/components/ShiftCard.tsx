'use client'

import { useState } from "react"
import { Clock, Edit, Check, Trash2 } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface ShiftCardProps {
  id: string
  startTime: string
  endTime: string
  teamName: string
  status: "pending" | "approved" | "completed" | "cancelled"
  onEdit?: (id: string) => void
  onApprove?: (id: string) => void
  onDelete?: (id: string) => void
  className?: string
}

export default function ShiftCard({
  id,
  startTime,
  endTime,
  teamName,
  status,
  onEdit = () => {},
  onApprove = () => {},
  onDelete = () => {},
  className = ""
}: ShiftCardProps) {
  const [currentStatus, setCurrentStatus] = useState(status)

  const handleApprove = () => {
    setCurrentStatus("approved")
    onApprove(id)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
      case "approved":
        return "bg-green-100 text-green-800 hover:bg-green-100"
      case "completed":
        return "bg-blue-100 text-blue-800 hover:bg-blue-100"
      case "cancelled":
        return "bg-red-100 text-red-800 hover:bg-red-100"
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-100"
    }
  }

  return (
    <Card className={`shadow-md hover:shadow-lg transition-shadow ${className}`}>
      <CardContent className="p-3 flex flex-col h-full">
        <div className="flex items-center mb-2">
          <Clock className="h-4 w-4 text-gray-500 mr-2" />
          <div className="text-sm font-medium">
            {startTime.substring(0, 5)} - {endTime.substring(0, 5)}
          </div>
        </div>

        {teamName && <h3 className="text-xs font-bold mb-1 opacity-75">{teamName}</h3>}

        <Badge variant="outline" className={`${getStatusColor(currentStatus)} capitalize w-fit mb-2 text-xs`}>
          {currentStatus}
        </Badge>

        <div className="mt-auto flex flex-col gap-1">
          <div className="flex justify-between gap-1">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1 text-xs p-1 h-6"
              onClick={() => onEdit(id)}
            >
              <Edit className="h-3 w-3 mr-1" />
              Edit
            </Button>

            {currentStatus !== "approved" && (
              <Button
                variant="outline"
                size="sm"
                className="flex-1 text-green-600 hover:text-green-700 border-green-200 hover:border-green-300 hover:bg-green-50 text-xs p-1 h-6"
                onClick={handleApprove}
              >
                <Check className="h-3 w-3 mr-1" />
                Approve
              </Button>
            )}
          </div>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300 hover:bg-red-50 text-xs p-1 h-6"
              >
                <Trash2 className="h-3 w-3 mr-1" />
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the shift.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => onDelete(id)} className="bg-red-600 hover:bg-red-700">
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardContent>
    </Card>
  )
}
