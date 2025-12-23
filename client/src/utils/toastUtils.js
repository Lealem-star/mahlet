import { toast } from 'react-toastify';

export const showConfirmationToast = (message, onConfirm) => {
  toast.warn(
    ({ closeToast }) => (
      <div>
        <p className="font-bold">Confirm Action</p>
        <p>{message}</p>
        <div className="flex justify-end gap-2 mt-3">
          <button
            className="px-3 py-1 bg-gray-300 rounded-md hover:bg-gray-400"
            onClick={closeToast}
          >
            Cancel
          </button>
          <button
            className="px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700"
            onClick={() => {
              onConfirm(closeToast);
            }}
          >
            Confirm
          </button>
        </div>
      </div>
    ),
    {
      position: 'top-center',
      autoClose: false,
      closeButton: false,
      draggable: false,
    }
  );
};

