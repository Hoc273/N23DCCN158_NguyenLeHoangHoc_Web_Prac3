'use client';
import { useState, useEffect } from 'react';
import api from '@/libs/api';
import toast from 'react-hot-toast';

type Post = {
  id: number;
  title: string;
  content: string;
  author: string;
};

export default function PostsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [author, setAuthor] = useState('');

  // State cho chỉnh sửa
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');

  const fetchPosts = async () => {
    const res = await api.get('/api/posts');
    setPosts(res.data);
  };

  useEffect(() => { fetchPosts(); }, []);

  // Đăng bài mới
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await toast.promise(
      api.post('/api/posts', { title, content, author }),
      {
        loading: 'Đang đăng bài...',
        success: 'Đăng bài thành công!',
        error: 'Đăng bài thất bại!',
      }
    );
    setTitle(''); setContent(''); setAuthor('');
    fetchPosts();
  };

  // Xóa bài
  const handleDelete = async (id: number) => {
    if (!confirm('Bạn chắc chắn muốn xoá?')) return;
    try {
      await api.delete(`/api/posts/${id}`);
      setPosts(prev => prev.filter(p => p.id !== id));
      toast.success('Đã xoá bài viết', { icon: '🗑️' });
    } catch {
      toast.error('Xoá thất bại!');
      fetchPosts();
    }
  };

  // Mở form sửa
  const handleEditOpen = (post: Post) => {
    setEditingPost(post);
    setEditTitle(post.title);
    setEditContent(post.content);
  };

  // Lưu chỉnh sửa
  const handleEditSave = async () => {
    if (!editingPost) return;
    await toast.promise(
      api.put(`/api/posts/${editingPost.id}`, {
        title: editTitle,
        content: editContent,
      }),
      {
        loading: 'Đang lưu...',
        success: 'Cập nhật thành công!',
        error: 'Cập nhật thất bại!',
      }
    );
    setEditingPost(null);
    fetchPosts();
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">📝 Quản lý Bài Viết</h1>

      {/* Form đăng bài */}
      <form onSubmit={handleSubmit} className="space-y-3 mb-8 bg-gray-50 p-4 rounded-lg">
        <input className="w-full border rounded p-2" value={title}
          onChange={e => setTitle(e.target.value)} placeholder="Tiêu đề" required />
        <textarea className="w-full border rounded p-2" value={content}
          onChange={e => setContent(e.target.value)} placeholder="Nội dung" required />
        <input className="w-full border rounded p-2" value={author}
          onChange={e => setAuthor(e.target.value)} placeholder="Tác giả" required />
        <button type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          Đăng bài
        </button>
      </form>

      {/* Inline edit form */}
      {editingPost && (
        <div className="mb-6 bg-yellow-50 border border-yellow-300 p-4 rounded-lg">
          <h2 className="font-bold mb-2">✏️ Đang sửa bài: {editingPost.title}</h2>
          <input className="w-full border rounded p-2 mb-2" value={editTitle}
            onChange={e => setEditTitle(e.target.value)} placeholder="Tiêu đề" />
          <textarea className="w-full border rounded p-2 mb-2" value={editContent}
            onChange={e => setEditContent(e.target.value)} placeholder="Nội dung" />
          <div className="flex gap-2">
            <button onClick={handleEditSave}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
              Lưu
            </button>
            <button onClick={() => setEditingPost(null)}
              className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500">
              Huỷ
            </button>
          </div>
        </div>
      )}

      {/* Danh sách bài viết */}
      {posts.map(p => (
        <div key={p.id} className="flex justify-between items-center p-3 border rounded mb-2">
          <div>
            <h3 className="font-bold">{p.title}</h3>
            <p className="text-sm text-gray-500">{p.author} · {p.content}</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => handleEditOpen(p)}
              className="text-blue-500 hover:text-blue-700 text-sm font-medium">
              Sửa
            </button>
            <button onClick={() => handleDelete(p.id)}
              className="text-red-500 hover:text-red-700 text-sm font-medium">
              Xoá
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}