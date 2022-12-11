import { History } from 'history'
import * as React from 'react'
import { Button, Divider, Grid, Header, Icon, Image, Input, Loader, TextArea } from 'semantic-ui-react'

import { createPost, deletePost, getPosts } from '../api/posts-api'
import Auth from '../auth/Auth'
import { Post } from '../types/Post'

interface PostsProps {
  auth: Auth
  history: History
}

interface PostsState {
  posts: Post[]
  newPostTitle: string
  newPostContent: string
  loadingPosts: boolean
  adding: boolean
}

export class Posts extends React.PureComponent<PostsProps, PostsState> {
  state: PostsState = {
    posts: [],
    newPostTitle: '',
    newPostContent: '',
    loadingPosts: true,
    adding: false
  }

  handleTitleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ newPostTitle: event.target.value })
  }

  handleContentChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    this.setState({ newPostContent: event.target.value })
  }

  onEditButtonClick = (postId: string) => {
    this.props.history.push(`/posts/${postId}/edit`)
  }

  onPostCreate = async () => {
    try {
      this.setState({adding: true})
      const newPost = await createPost(this.props.auth.getIdToken(), {
        title: this.state.newPostTitle,
        content: this.state.newPostContent
      })
      this.setState({
        posts: [...this.state.posts, newPost],
        newPostTitle: ''
      })
    } catch {
      alert('Post creation failed')
    } finally {
      this.setState({adding: false, newPostContent: '', newPostTitle: ''})
    }
  }

  onPostDelete = async (postId: string) => {
    try {
      await deletePost(this.props.auth.getIdToken(), postId)
      this.setState({
        posts: this.state.posts.filter(post => post.postId !== postId)
      })
    } catch {
      alert('Post deletion failed')
    }
  }

  async componentDidMount() {
    try {
      const posts = await getPosts(this.props.auth.getIdToken())
      this.setState({
        posts: posts,
        loadingPosts: false
      })
    } catch (e) {
      alert(`Failed to fetch posts: ${(e as Error).message}`)
    }
  }

  render() {
    return (
      <div>
        <Header as="h1">POSTS</Header>

        {this.renderCreatePostInput()}

        {this.renderPosts()}
      </div>
    )
  }

  renderCreatePostInput() {
    return (
      <Grid.Row>
        <Grid.Column width={16}>
          <div style={{display: 'flex', flexDirection: 'column', gap: 20}}>
            <div style={{display: 'flex', flexDirection: 'column', gap: 10}}>
              <Input
                value={this.state.newPostTitle}
                placeholder="Post title"
                onChange={this.handleTitleChange}
              />
              <TextArea
                value={this.state.newPostContent}
                rows={5}
                placeholder="Post content"
                onChange={this.handleContentChange}
              />
            </div>
            <Button loading={this.state.adding} style={{alignSelf: 'flex-end'}} disabled={!this.state.newPostTitle || !this.state.newPostContent} onClick={this.onPostCreate}>Add</Button>
          </div>
        </Grid.Column>
        <Grid.Column width={16}>
          <Divider />
        </Grid.Column>
      </Grid.Row>
    )
  }

  renderPosts() {
    if (this.state.loadingPosts) {
      return this.renderLoading()
    }

    return this.renderPostsList()
  }

  renderLoading() {
    return (
      <Grid.Row>
        <Loader indeterminate active inline="centered">
          Loading POSTS
        </Loader>
      </Grid.Row>
    )
  }

  renderPostsList() {
    return (
      <Grid padded>
        {this.state.posts.map((post, pos) => {
          return (
            <Grid.Row key={post.postId}>
              <Grid.Column width={14} verticalAlign="middle">
                <div style={{marginBottom: 10, fontWeight: 600}}>
                  {post.title}
                </div>
                <div>
                  {post.content}
                </div>
              </Grid.Column>
              <Grid.Column width={1} floated="right">
                <Button
                  icon
                  color="blue"
                  onClick={() => this.onEditButtonClick(post.postId)}
                >
                  <Icon name="pencil" />
                </Button>
              </Grid.Column>
              <Grid.Column width={1} floated="right">
                <Button
                  icon
                  color="red"
                  onClick={() => this.onPostDelete(post.postId)}
                >
                  <Icon name="delete" />
                </Button>
              </Grid.Column>
              {post.attachmentUrl && (
                <Image src={post.attachmentUrl} size="small" wrapped />
              )}
              <Grid.Column width={16}>
                <Divider />
              </Grid.Column>
            </Grid.Row>
          )
        })}
      </Grid>
    )
  }

}
