# _plugins/slugify_latin.rb
# Override Jekyll's slugify method to always use Latin transliteration

module Jekyll
  module Utils
    class << self
      # Override the slugify method to always use Latin mode
      alias_method :original_slugify, :slugify
      
      def slugify(string, mode: nil, cased: false)
        # Force Latin mode for all slugification
        mode = 'latin'
        
        return nil if string.nil?
        return string if mode == 'raw'

        # Apply Latin transliteration first
        if mode == 'latin'
          # Portuguese and other Latin character mappings
          transliterations = {
            # Portuguese specific
            'á' => 'a', 'à' => 'a', 'ã' => 'a', 'â' => 'a', 'ä' => 'a',
            'é' => 'e', 'è' => 'e', 'ê' => 'e', 'ë' => 'e',
            'í' => 'i', 'ì' => 'i', 'î' => 'i', 'ï' => 'i',
            'ó' => 'o', 'ò' => 'o', 'õ' => 'o', 'ô' => 'o', 'ö' => 'o',
            'ú' => 'u', 'ù' => 'u', 'û' => 'u', 'ü' => 'u',
            'ç' => 'c', 'ñ' => 'n',
            # Uppercase versions
            'Á' => 'A', 'À' => 'A', 'Ã' => 'A', 'Â' => 'A', 'Ä' => 'A',
            'É' => 'E', 'È' => 'E', 'Ê' => 'E', 'Ë' => 'E',
            'Í' => 'I', 'Ì' => 'I', 'Î' => 'I', 'Ï' => 'I',
            'Ó' => 'O', 'Ò' => 'O', 'Õ' => 'O', 'Ô' => 'O', 'Ö' => 'O',
            'Ú' => 'U', 'Ù' => 'U', 'Û' => 'U', 'Ü' => 'U',
            'Ç' => 'C', 'Ñ' => 'N'
          }
          
          # Apply transliterations
          slug = string.dup
          transliterations.each do |accented, plain|
            slug.gsub!(accented, plain)
          end
        else
          slug = string.dup
        end
        
        # Apply standard slugification
        slug = slug.downcase unless cased
        slug.gsub!(/[^\p{M}\p{L}\p{Nd}]+/u, '-')
        slug.gsub!(/-+/, '-')
        slug.sub!(/^-/, '')
        slug.sub!(/-$/, '')
        slug
      end
    end
  end
end
