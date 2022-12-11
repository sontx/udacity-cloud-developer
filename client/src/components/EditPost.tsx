import * as React from 'react'
import { Form, Button, TextArea, Input } from 'semantic-ui-react'
import Auth from '../auth/Auth'
import { getPost, getUploadUrl, patchPost, uploadFile } from '../api/posts-api'
import { useEffect, useState } from 'react'
import { Post } from '../types/Post'

enum UploadState {
  NoUpload,
  FetchingPresignedUrl,
  UploadingFile,
}

interface EditPostProps {
  match: {
    params: {
      postId: string
    }
  }
  auth: Auth
}

interface EditPostState {
  file: any
  uploadState: UploadState
}

function EditPostContent({postId, token} : any) {
  const [post, setPost] = useState<Post | null>(null);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    let cancel = false;
    getPost(token, postId).then((post) => {
      if (!cancel) {
        setPost(post);
      }
    })

    return () => {
      cancel = true;
    }
  }, [postId, token])

  console.log("has post", post)

  return <div>
    <h1>Edit post content</h1>

    <Form onSubmit={() => {
      console.log("updating", post)
      if (post) {
        setUpdating(true)
        patchPost(token, postId, {
          content: post?.content ?? '',
          title: post?.title ?? ''
        }).finally(() => {
          setUpdating(false)
        })
      }
    }}>
      <Form.Field>
        <label>Title</label>
        <Input
          disabled={!post || updating}
          value={post?.title}
          placeholder="Title"
          onChange={event => {
            if (post) {
              setPost({...post, title: event.target.value})
            }
          }}
        />
      </Form.Field>
      <Form.Field>
        <label>Content</label>
        <TextArea
          rows={5}
          disabled={!post || updating}
          value={post?.content}
          placeholder="Content"
          onChange={event => {
            if (post) {
              setPost({...post, content: event.target.value})
            }
          }}
        />
      </Form.Field>

      <Button disabled={updating || !post?.title || !post?.content} type='submit'>Update</Button>
    </Form>
  </div>
}

export class EditPost extends React.PureComponent<
  EditPostProps,
  EditPostState
> {
  state: EditPostState = {
    file: undefined,
    uploadState: UploadState.NoUpload
  }

  handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files) return

    this.setState({
      file: files[0]
    })
  }

  handleSubmit = async (event: React.SyntheticEvent) => {
    event.preventDefault()

    try {
      if (!this.state.file) {
        alert('File should be selected')
        return
      }

      this.setUploadState(UploadState.FetchingPresignedUrl)
      const uploadUrl = await getUploadUrl(this.props.auth.getIdToken(), this.props.match.params.postId)

      this.setUploadState(UploadState.UploadingFile)
      await uploadFile(uploadUrl, this.state.file)

      alert('File was uploaded!')
    } catch (e) {
      alert('Could not upload a file: ' + (e as Error).message)
    } finally {
      this.setUploadState(UploadState.NoUpload)
    }
  }

  setUploadState(uploadState: UploadState) {
    this.setState({
      uploadState
    })
  }

  render() {
    return (
      <>
        <EditPostContent postId={this.props.match.params.postId} token={this.props.auth.getIdToken()}/>
        <div style={{marginTop: 20}}>
          <h1>Upload new image</h1>

          <Form onSubmit={this.handleSubmit}>
            <Form.Field>
              <label>File</label>
              <input
                type="file"
                accept="image/*"
                placeholder="Image to upload"
                onChange={this.handleFileChange}
              />
            </Form.Field>

            {this.renderButton()}
          </Form>
        </div>
      </>
    )
  }

  renderButton() {

    return (
      <div>
        {this.state.uploadState === UploadState.FetchingPresignedUrl && <p>Uploading image metadata</p>}
        {this.state.uploadState === UploadState.UploadingFile && <p>Uploading file</p>}
        <Button
          loading={this.state.uploadState !== UploadState.NoUpload}
          type="submit"
        >
          Upload
        </Button>
      </div>
    )
  }
}
