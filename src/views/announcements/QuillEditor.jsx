import { useCallback, useMemo, useRef, useState } from 'react';
import QuillEditor from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import Quill from 'quill';

const apiUrl = import.meta.env.VITE_SERVER_URL;

// Register the custom video format
const Video = Quill.import('formats/video');

class CustomVideo extends Video {
  static create(value) {
    const node = super.create(value);
    node.setAttribute('controls', true);
    node.setAttribute('width', '400');
    return node;
  }

  static formats(node) {
    return node.getAttribute('src');
  }
}

Quill.register(CustomVideo, true);

const Editor = (props) => {
  const { setFieldValue, value, fieldName, placeholder, charLimit } = props;
  const [imageUrls, setImageUrls] = useState([]);
  const [videoUrls, setVideoUrls] = useState([]);
  const [remainingCharacters, setRemainingCharacters] = useState(charLimit);
  const quill = useRef();

  // console.log(charLimit, 'ksdjlasfk');

  // Image upload handler
  const imageHandler = useCallback(() => {
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/*');
    input.click();

    input.onchange = () => {
      const file = input.files[0];
      const formData = new FormData();
      formData.append('image', file);
      formData.append('folder', 'announcements');

      fetch(`${apiUrl}/api/announcements/upload-image`, {
        method: 'POST',
        body: formData
      })
        .then((response) => response.json())
        .then((data) => {
          const imageUrl = data;
          const quillEditor = quill.current.getEditor();
          const range = quillEditor.getSelection(true);
          quillEditor.insertEmbed(range.index, 'image', imageUrl, 'user');
        })
        .catch((error) => console.error(error));
    };
  }, []);

  // Video upload handler
  const videoHandler = useCallback(() => {
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'video/*');
    input.click();

    input.onchange = () => {
      const file = input.files[0];
      const formData = new FormData();
      formData.append('image', file);
      formData.append('folder', 'announcements');

      fetch(`${apiUrl}/api/announcements/upload-image`, {
        method: 'POST',
        body: formData
      })
        .then((response) => response.json())
        .then((data) => {
          const videoUrl = data;
          const quillEditor = quill.current.getEditor();
          const range = quillEditor.getSelection(true);
          quillEditor.insertEmbed(range.index, 'video', videoUrl);
        })
        .catch((error) => console.error(error));
    };
  }, []);

  // Handle image deletion
  const deleteImage = useCallback((imageUrl) => {
    console.log('deleteImage', imageUrl);
    fetch(`${apiUrl}/api/announcements/delete-image`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ imageUrl })
    })
      .then((response) => response.json())
      .then((data) => console.log(data))
      .catch((error) => console.error(error));
  }, []);

  // Quill editor modules (toolbar, clipboard)
  const modules = useMemo(
    () => ({
      toolbar: {
        container: [
          [{ header: [2, 3, 4, false] }],
          ['bold', 'italic', 'underline', 'blockquote'],
          [{ color: [] }],
          [{ list: 'ordered' }, { list: 'bullet' }, { indent: '-1' }, { indent: '+1' }],
          ['link', 'image', 'video'],
          ['clean']
        ],
        handlers: {
          image: imageHandler,
          video: videoHandler
        }
      },
      keyboard: {
        bindings: {
          // Fix the issue with multiple newlines on Enter
          enter: {
            key: 13,
            handler: function () {
              const quillEditor = quill.current.getEditor();
              quillEditor.insertText(quillEditor.getSelection().index, '\n');
              return false;
            }
          },
          backspace: {
            key: 8,
            handler: function () {
              // Prevent the backspace from causing additional lines
              const quillEditor = quill.current.getEditor();
              const range = quillEditor.getSelection();
              if (range.index === 0) return true; // No modification at the start of content
              return true;
            }
          }
        }
      },
      clipboard: {
        matchVisual: true
      }
    }),
    [imageHandler, videoHandler]
  );

  // Quill editor formats
  const formats = [
    'header',
    'bold',
    'italic',
    'underline',
    'strike',
    'blockquote',
    'list',
    'bullet',
    'indent',
    'link',
    // 'image',
    // 'video',
    'color',
    'clean'
  ];

  const onChange = (content, delta, source, editor) => {
    // console.log(editor.getText(), 'text editor content');

    // set character limit
    if (charLimit) {
      const quillEd = quill.current?.getEditor();
      if (quillEd) {
        const currentText = quillEd.getText();
        const textLength = currentText.length - 1;
        setRemainingCharacters(charLimit - textLength);

        if (textLength > charLimit) {
          quillEd.deleteText(charLimit, textLength);
          setRemainingCharacters(0);
        }
        // console.log(quillEd.root.innerHTML, 'inner html of editor contnet');
        setFieldValue(fieldName, quillEd.root.innerHTML);
      } else {
        // console.log('no quill editor');
        setFieldValue(fieldName, content);
      }
    } else {
      setFieldValue(fieldName, content);
    }

    // Handle inserted images
    const imageUrl = editor.getContents().ops.find((op) => op.insert.image || op.insert.video);
    if (imageUrl) {
      setImageUrls((prevImageUrls) => [...prevImageUrls, imageUrl.insert.image]);
    }

    const deletedImageUrls = imageUrls.filter((url) => !content.includes(url));
    if (deletedImageUrls.length > 0) {
      deleteImage(deletedImageUrls);
    }

    // Handle inserted videos
    const videoUrl = editor.getContents().ops.find((op) => op.insert.video);
    if (videoUrl) {
      setImageUrls((prevImageUrls) => [...prevImageUrls, videoUrl.insert.video]);
    }

    const deletedVideoUrls = videoUrl?.filter((url) => !content.includes(url)) || [];
    if (deletedVideoUrls.length > 0) {
      deleteImage(deletedVideoUrls);
    }
  };

  return (
    <>
      <QuillEditor
        ref={(el) => (quill.current = el)}
        theme="snow"
        placeholder={placeholder}
        value={value}
        formats={formats}
        modules={modules}
        onChange={onChange}
      />
      {charLimit ? <p>Remaining characters: {remainingCharacters}</p> : ''}
    </>
  );
};

export default Editor;
