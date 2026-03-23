'use client';

import { BlogEditor } from '@/components/blog/BlogEditor';
import { useParams } from 'next/navigation';

export default function EditBlogPostPage() {
    const params = useParams();
    const id = params.id as string;

    return <BlogEditor postId={id} />;
}
