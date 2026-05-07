import React, { useEffect, useState } from "react";
import Image from "next/image";

const Modal = ({ modal, setModal, headerTitle }) => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewImages, setPreviewImages] = useState([]);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");

  const imageChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);

      setSelectedImage(files);

      const imageUrls = files.map((file) => ({
        file,
        url: URL.createObjectURL(file),
      }));

      setPreviewImages(imageUrls);
    }
  };

  const removeSelectedImage = () => {
    previewImages.forEach((image) => URL.revokeObjectURL(image.url));

    setSelectedImage(null);
    setPreviewImages([]);
  };

  const handleSubmit = () => {
    // Reset modal state
    setModal(false);
  };

  useEffect(() => {
    if (!modal) {
      removeSelectedImage();
    }

    return () => {
      previewImages.forEach((image) => URL.revokeObjectURL(image.url));
    };
  }, [modal]);

  return (
    <>
      {modal && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          {/* Overlay */}
          <div className="fixed inset-0 bg-black/70 z-40"></div>

          {/* Modal */}
          <div className="bg-white mx-auto rounded-lg shadow-lg overflow-y-auto w-[600px] max-w-[90%] max-h-[90vh] z-50 relative">
            {/* Header */}
            <div className="bg-purple-600 relative py-2">
              <p className="text-lg font-bold text-center text-white">
                {headerTitle}
              </p>

              <button
                className="absolute top-2 right-2 w-6 h-6 bg-gray-400 rounded-full flex items-center justify-center"
                onClick={() => setModal(false)}
              >
                <span className="text-white text-lg leading-none">
                  &times;
                </span>
              </button>
            </div>

            {/* Content */}
            <div className="px-6 py-4 space-y-4">
              {/* Name */}
              <div className="flex justify-between items-center">
                <label className="font-semibold pr-2">Name</label>

                <input
                  className="border-2 border-purple-600/50 w-[75%] p-2 rounded"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              {/* Category */}
              <div className="flex justify-between items-center">
                <label className="font-semibold pr-2">Category</label>

                <select
                  className="border-2 border-purple-600/50 w-[75%] p-2 rounded"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value="">Choose any Category</option>
                  <option value="Option One">Option One</option>
                  <option value="Option Two">Option Two</option>
                  <option value="Option Three">Option Three</option>
                </select>
              </div>

              {/* Picture Upload */}
              <div className="flex flex-col">
                <label className="font-semibold pr-2 mb-2">Picture</label>

                <input
                  className="border-2 p-2 rounded"
                  type="file"
                  accept="image/*"
                  name="user[image]"
                  multiple
                  onChange={imageChange}
                />

                {/* Preview Images */}
                <div className="flex overflow-auto my-2 p-2 gap-2">
                  {previewImages.map((image, index) => (
                    <div
                      key={index}
                      className="relative w-32 h-32 border-4 rounded-sm overflow-hidden"
                    >
                      <Image
                        src={image.url}
                        alt={`Preview ${index + 1}`}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                  ))}
                </div>

                {/* Remove Button */}
                {selectedImage && (
                  <button
                    onClick={removeSelectedImage}
                    className="bg-orange-400 p-2 rounded-md text-white w-fit"
                  >
                    Remove This Image
                  </button>
                )}
              </div>

              {/* Submit */}
              <div className="flex justify-between">
                <button
                  className="bg-gray-700 text-white p-3 w-full mt-5 text-lg rounded"
                  onClick={handleSubmit}
                >
                  Submit
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Modal;