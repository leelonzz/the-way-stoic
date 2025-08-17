import {definePlugin} from 'sanity'
import {AutoImagePortableTextEnhanced} from './components/AutoImagePortableTextEnhanced'

export const autoImageUploadPlugin = definePlugin({
  name: 'auto-image-upload',
  form: {
    components: {
      input: (props) => {
        // Only apply to portable text fields named 'body'
        const isBodyField = props.path[props.path.length - 1] === 'body'
        const isPortableText = props.schemaType?.jsonType === 'array' && 
          props.schemaType?.of?.some((type: any) => type.name === 'block')
        
        if (isBodyField && isPortableText) {
          return AutoImagePortableTextEnhanced
        }
        
        // Return undefined to use default component
        return undefined
      }
    }
  }
})
