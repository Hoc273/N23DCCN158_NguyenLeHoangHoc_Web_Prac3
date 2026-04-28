'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import api from '@/libs/api';
import toast from 'react-hot-toast';

type Post = {
  id: number;
  title: string;
  content: string;
  author: string;
};

export default function PostsPage() {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [author, setAuthor] = useState('');
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');

  // Fetch tự động cache
 const { data: posts, isLoading } = useQuery({
  queryKey: ['posts'],
  queryFn: () => api.get('/api/posts').then(r => r.data)
});

  // Mutation tạo bài
  const createMutation = useMutation({
    mutationFn: (data: any) => api.post('/api/posts', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      toast.success('Đăng bài thành công!');
      setTitle(''); setContent(''); setAuthor('');
    },
    onError: () => toast.error('Đăng bài thất bại!'),
  });

  // Mutation xóa
  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/api/posts/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      toast.success('Đã xoá bài viết', { icon: '🗑️' });
    },
    onError: () => toast.error('Xoá thất bại!'),
  });

  // Mutation sửa
  const editMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      api.put(`/api/posts/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      toast.success('Cập nhật thành công!');
      setEditingPost(null);
    },
    onError: () => toast.error('Cập nhật thất bại!'),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({ title, content, author });
  };

  const handleEditOpen = (post: Post) => {
    setEditingPost(post);
    setEditTitle(post.title);
    setEditContent(post.content);
  };

  const handleEditSave = () => {
    if (!editingPost) return;
    editMutation.mutate({
      id: editingPost.id,
      data: { title: editTitle, content: editContent },
    });
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">📝 Quản lý Bài Viết</h1>

      <form onSubmit={handleSubmit} className="space-y-3 mb-8 bg-gray-50 p-4 rounded-lg">
        <input className="w-full border rounded p-2" value={title}
          onChange={e => setTitle(e.target.value)} placeholder="Tiêu đề" required />
        <textarea className="w-full border rounded p-2" value={content}
          onChange={e => setContent(e.target.value)} placeholder="Nội dung" required />
        <input className="w-full border rounded p-2" value={author}
          onChange={e => setAuthor(e.target.value)} placeholder="Tác giả" required />
        <button type="submit" disabled={createMutation.isPending}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50">
          {createMutation.isPending ? 'Đang đăng...' : 'Đăng bài'}
        </button>
      </form>

      {editingPost && (
        <div className="mb-6 bg-yellow-50 border border-yellow-300 p-4 rounded-lg">
          <h2 className="font-bold mb-2">✏️ Đang sửa: {editingPost.title}</h2>
          <input className="w-full border rounded p-2 mb-2" value={editTitle}
            onChange={e => setEditTitle(e.target.value)} />
          <textarea className="w-full border rounded p-2 mb-2" value={editContent}
            onChange={e => setEditContent(e.target.value)} />
          <div className="flex gap-2">
            <button onClick={handleEditSave}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
              Lưu
            </button>
            <button onClick={() => setEditingPost(null)}
              className="bg-gray-400 text-white px-4 py-2 rounded">
              Huỷ
            </button>
          </div>
        </div>
      )}

      {isLoading && <p className="text-gray-400">Đang tải...</p>}

      {(posts || []).map((p: Post)=> (
        <div key={p.id} className="flex justify-between items-center p-3 border rounded mb-2">
          <div>
            <h3 className="font-bold">{p.title}</h3>
            <p className="text-sm text-gray-500">{p.author} · {p.content}</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => handleEditOpen(p)}
              className="text-blue-500 hover:text-blue-700 text-sm font-medium">Sửa</button>
            <button onClick={() => deleteMutation.mutate(p.id)}
              className="text-red-500 hover:text-red-700 text-sm font-medium">Xoá</button>
          </div>
        </div>
      ))}
    </div>
  );
}