const db = require('../dbConfig');

function get(id) {
  db('posts').where({id}).first();
}

function getUserPosts(id) {
    return db('posts').where({user_id: id})
      .then(posts => {
        return posts.map(async post => {
          const bubbles = await db.select('b.id', 'b.bubble', 'b.created_at').from('bubbles as b').innerJoin('post_bubbles as pb', 'pb.bubble_id', 'b.id').where({'pb.post_id': post.id})
          const comments = await db.select('pc.id', 'u.name', 'pc.comment', 'pc.created_at').from('post_comments as pc')
          .innerJoin('user_profiles as u', 'pc.user_id', 'u.id')
          .where({'pc.post_id': post.id});
          //console.log({...post, bubbles, comments})
          return {...post, bubbles, comments};
        })
      })
}

function getFilteredPosts(schoolID, id) {
  return db.select('p.id', 'u.name', 'p.post_content', 'p.likes', 'p.created_at').from('posts as p')
  .innerJoin('user_profiles as u', 'p.user_id', 'u.id').where({'u.school_id': schoolID})
  .innerJoin('post_bubbles as pb', 'pb.post_id', 'p.id')
  .where({'pb.bubble_id': id})
  .then(posts => {
    return posts.map(async post => {
      const bubbles = await db.select('b.id', 'b.bubble', 'b.created_at').from('bubbles as b').innerJoin('post_bubbles as pb', 'pb.bubble_id', 'b.id').where({'pb.post_id': post.id})
      const comments = await db.select('pc.id', 'u.name', 'pc.comment', 'pc.created_at').from('post_comments as pc')
      .innerJoin('user_profiles as u', 'pc.user_id', 'u.id')
      .where({'pc.post_id': post.id});
      return {...post, bubbles: bubbles, comments};
    })
  })
  .catch(err => console.log(err));
}

function deletePost(id) {
  return db('posts').where({id}).del();
}

const updatePost = async (id, post) => {
  const count = await db('posts').where({id}).update({user_id: post.user_id, post_content: post.post_content});
  await db('post_bubbles').where({'post_id': id}).del();
  if(count > 0) {
    const ids = await Promise.all(post.bubbles.map( async bubble => {
      return await db('post_bubbles').insert({bubble_id: bubble, post_id: id});
    }));

    const newPost = await db.select('p.id', 'u.name', 'p.post_content', 'p.likes', 'p.created_at').from('posts as p')
    .innerJoin('user_profiles as u', 'p.user_id', 'u.id').where({'p.id': id}).first();
  
    const bubbles = await db.select('b.id', 'b.bubble', 'b.created_at').from('bubbles as b').innerJoin('post_bubbles as pb', 'pb.bubble_id', 'b.id').where({'pb.post_id': id});
  
    return {
      ...newPost,
      bubbles
    }
  } else {
    return null;
  }
}

const addPost = async post => {
  //console.log(typeof post.user_id);
  //console.log(typeof post.post_content);
  const postID = await db('posts').returning('id').insert({user_id: post.user_id, post_content: post.post_content});

  const ids = await Promise.all(post.bubbles.map( async bubble => {
    return await db('post_bubbles').insert({bubble_id: bubble, post_id: postID[0]});
  }));

  //console.log('Da ID', typeof postID[0]);

  // const newPost = await db.select('p.id', 'u.name', 'p.post_content', 'p.likes', 'p.created_at').from('posts as p')
  // .innerJoin('user_profiles as u', 'p.user_id', 'u.id')
  // .innerJoin('post_bubbles as pb', 'pb.post_id', 'p.id')
  // .where({'p.id': id});

  const newPost = await db.select('p.id', 'u.name', 'p.post_content', 'p.likes', 'p.created_at').from('posts as p')
  .innerJoin('user_profiles as u', 'p.user_id', 'u.id').where({'p.id': Number(postID[0])}).first();

  const bubbles = await db.select('b.id', 'b.bubble', 'b.created_at').from('bubbles as b').innerJoin('post_bubbles as pb', 'pb.bubble_id', 'b.id').where({'pb.post_id': postID[0]});

  return {
    ...newPost,
    bubbles
  }

  // return db.select('p.id', 'u.name', 'p.post_content', 'p.likes', 'p.created_at').from('posts as p')
  // .innerJoin('user_profiles as u', 'p.user_id', 'u.id')
  // .innerJoin('post_bubbles as pb', 'pb.post_id', 'p.id')
  // .where({'p.id': id})
}


module.exports = {
  getUserPosts,
  getFilteredPosts,
  deletePost,
  addPost,
  updatePost
}