"use client"
import Image from "next/image"
import Link from "next/link"
import { useEffect, useState } from "react"

import Fancybox from "./FancyBox"

export default function InstaFeed() {
  const [instagramFeed, setInstagramFeed] = useState(null)
  const [after, setAfter] = useState(null)
  const [error, setError] = useState(null)

  const fetchFeed = async (after = null) => {
    try {
      let url = `https://graph.instagram.com/me/media?fields=id,caption,media_url,media_type,timestamp,permalink&access_token=${process.env.NEXT_PUBLIC_INSTAGRAM_TOKEN}`
      if (after) {
        url += `&after=${after}`
      }
      const data = await fetch(url)

      if (!data.ok) {
        throw new Error("Failed to fetch Instagram feed")
      }

      const feed = await data.json()

      setInstagramFeed(prevFeed => {
        if (prevFeed && prevFeed.data.length > 0) {
          return {
            ...feed,
            data: [...prevFeed.data, ...feed.data]
          }
        }
        return feed
      })
      setAfter(feed.paging?.cursors.after)
    } catch (err) {
      console.error("Error fetching Instagram feed:", err.message)
      setError(err.message)
    }
  }

  const loadMore = () => {
    fetchFeed(after)
  }

  // Fetch the initial feed
  useEffect(() => {
    fetchFeed()
  }, [])

  return (
    <>
      {error && <p className="text-red-500">{error}</p>}

      {instagramFeed && (
        <section className="">
          <div className="d-flex justify-content-between align-items-center my-5">
          <Fancybox
            options={{
              Carousel: {
                animated: true,
                infinite: false,
              },
            }}
          >
            {instagramFeed.data.map((post) => {
              return (
                <a key={post.id} href={post.media_url || ''} data-fancybox="gallery" >
                  <img
                     src={post.media_url}
                     alt={post.caption ?? ""}
                     
                     style={{
                      width: "20%",  //its same to '20%' of device width
                      height: "auto",
                      resizeMode: 'contain', //optional
                  }}
                  />
                </a>

              );
            })}

          </Fancybox>
          </div>
          {after && 
                      <div className='d-flex justify-content-center align-items-center my-5'>
                      
                      <button className='btn btn-primary me-2 btn-lg mb-2' onClick={loadMore}>Load More</button>
                    </div>
          
          
          }
        </section>
      )}
    </>
  )
}
