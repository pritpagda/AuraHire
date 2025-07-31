import React, {useState} from "react";
import {Application} from "../types/application";
import {Edit2, GripVertical, Trash2} from "lucide-react";
import {useSortable} from "@dnd-kit/sortable";
import {CSS} from "@dnd-kit/utilities";
import ConfirmDialog from "./ConfirmDialog";

interface Props {
    app: Application;
    onDelete: (id: string) => void;
    onEdit: () => void;
    onClick?: () => void;
}

const statusColors: Record<Application["status"], string> = {
    applied: "bg-blue-500", interview_scheduled: "bg-amber-500", offer: "bg-emerald-500", rejected: "bg-red-500",
};

const ApplicationCard: React.FC<Props> = ({app, onDelete, onEdit, onClick}) => {
    const {attributes, listeners, setNodeRef, transform, transition} = useSortable({id: app.id});

    const style = {
        transform: CSS.Transform.toString(transform), transition,
    };

    const [confirmOpen, setConfirmOpen] = useState(false);

    const handleDeleteClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        setConfirmOpen(true);
    };

    const confirmDelete = () => {
        onDelete(app.id);
        setConfirmOpen(false);
    };

    return (<>
        <div
            ref={setNodeRef}
            style={style}
            className="group relative bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm hover:shadow-md border border-gray-200 dark:border-gray-700 cursor-pointer hover:scale-[1.02] transition duration-200"
            onClick={onClick}
        >
            <div className={`absolute top-0 left-0 right-0 h-0.5 rounded-t-xl ${statusColors[app.status]}`}/>

            <div className="flex justify-between items-start mb-4">
                <h3 className="font-semibold text-lg text-gray-900 dark:text-white truncate">
                    {app.company_name}
                </h3>

                <div
                    className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                    onClick={(e) => e.stopPropagation()}
                >
                    <button
                        onClick={onEdit}
                        title="Edit"
                        className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                    >
                        <Edit2 className="w-4 h-4"/>
                    </button>
                    <button
                        onClick={handleDeleteClick}
                        title="Delete"
                        className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    >
                        <Trash2 className="w-4 h-4"/>
                    </button>
                </div>
            </div>

            <p className="text-gray-700 dark:text-gray-300 font-medium mb-3">
                {app.position_title}
            </p>

            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                {app.application_date ? new Date(app.application_date).toLocaleDateString() : "No date"}
            </p>

            <div className="flex items-center justify-between">
          <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium text-white ${statusColors[app.status]}`}>
            {app.status.replace("_", " ")}
          </span>

                <GripVertical
                    {...listeners}
                    {...attributes}
                    className="w-4 h-4 cursor-move text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                />
            </div>
        </div>

        <ConfirmDialog open={confirmOpen} onConfirm={confirmDelete} onCancel={() => setConfirmOpen(false)}/>
    </>);
};

export default ApplicationCard;
