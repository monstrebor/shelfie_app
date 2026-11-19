
import { createContext, useEffect, useState } from 'react'
import { databases, client, channel } from '../lib/appwrite'
import { ID, Permission, Query, Role } from 'react-native-appwrite'
import { useUser } from './UserContext'

const DATABASE_ID = "6afc5ee10008965e6b52"
const COLLECTION_ID = "6afc5f0500348b77e84b"

export const BooksContext = createContext()

export function BooksProvider({ children }) {
    const [books, setBooks] = useState([])
    const { user } = useUser()

    async function fetchBooks() {
        if (!user?.$id) return

        try {
            const response = await databases.listDocuments(
                DATABASE_ID,
                COLLECTION_ID,
                [
                    Query.equal('userId', user.$id)
                ]
            )

            setBooks(response.documents)
        } catch (error) {
            console.log('Fetch books:', error.message)
        }
    }

    async function fetchBookById(id) {
        try {
            const response = await databases.getDocument(
                DATABASE_ID,
                COLLECTION_ID,
                id
            )

            return response
        } catch (error) {
            console.log('Fetch book:', error.message)
            throw error
        }
    }

    async function createBook(data) {
        if (!user?.$id) {
            throw new Error('Please log in first.')
        }

        try {
            const newBook = await databases.createDocument(
                DATABASE_ID,
                COLLECTION_ID,
                ID.unique(),
                {
                    ...data,
                    userId: user.$id
                },
                [
                    Permission.read(Role.user(user.$id)),
                    Permission.update(Role.user(user.$id)),
                    Permission.delete(Role.user(user.$id))
                ]
            )

            // Update the table immediately.
            setBooks(prevBooks => [...prevBooks, newBook])

            return newBook
        } catch (error) {
            console.log('Create book:', error.message)
            throw error
        }
    }

    async function deleteBook(id) {
        try {
            await databases.deleteDocument(
                DATABASE_ID,
                COLLECTION_ID,
                id
            )

            setBooks(prevBooks =>
                prevBooks.filter(book => book.$id !== id)
            )
        } catch (error) {
            console.log('Delete book:', error.message)
            throw error
        }
    }

useEffect(() => {
    if (!user?.$id) {
        setBooks([])
        return
    }

    fetchBooks()

    // Subscribe to realtime updates
    const unsubscribe = client.subscribe(channel, (response) => {
        const { payload, events } = response

        if (events[0].includes('create')) {
            setBooks((prevBooks) => {
                // Prevent duplicate books
                const exists = prevBooks.some(
                    book => book.$id === payload.$id
                )

                if (exists) return prevBooks

                return [...prevBooks, payload]
            })
        }

        if (events[0].includes('delete')) {
            setBooks((prevBooks) =>
                prevBooks.filter(
                    book => book.$id !== payload.$id
                )
            )
        }

        if (events[0].includes('update')) {
            setBooks((prevBooks) =>
                prevBooks.map(book =>
                    book.$id === payload.$id ? payload : book
                )
            )
        }
    })

    // Cleanup subscription
    return () => {
        unsubscribe()
    }

}, [user?.$id])

    return (
        <BooksContext.Provider
            value={{
                books,
                fetchBooks,
                fetchBookById,
                createBook,
                deleteBook
            }}
        >
            {children}
        </BooksContext.Provider>
    )
}
