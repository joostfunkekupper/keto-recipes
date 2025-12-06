'use client'

export default function About() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-8 mb-6">
        <h2 className="text-3xl font-bold text-gray-800 mb-6">About This Website</h2>

        <div className="prose prose-lg text-gray-700 space-y-4">
          <p>
            Welcome to the Ketogenic Therapy Diet Recipes platform. This website is designed to help
            individuals and families manage ketogenic diet recipes, particularly those using the diet
            as a therapeutic intervention. The ketogenic diet is a high-fat, adequate-protein, low-carbohydrate
            diet that has been used to treat various medical conditions, most notably drug-resistant epilepsy.
          </p>

          <p>
            Our platform provides tools to:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Track food items with their macronutrient content (protein, fat, and carbohydrates)</li>
            <li>Create and manage recipes with automatic macro calculations</li>
            <li>Calculate ketogenic ratios (fat to protein+carbs ratio) for each recipe</li>
            <li>Set and monitor target ketogenic ratios based on individual needs</li>
            <li>Share recipes with the community or keep them private</li>
          </ul>

          <p>
            Whether you are following a ketogenic diet for medical reasons or personal health goals,
            this platform aims to simplify meal planning and ensure accurate tracking of nutritional values.
          </p>
        </div>
      </div>

      <div className="bg-yellow-50 border-2 border-yellow-400 rounded-lg shadow-md p-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
          <svg className="w-6 h-6 mr-2 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          Important Recipe Disclaimer
        </h2>

        <div className="text-gray-700 space-y-4">
          <p className="font-semibold text-gray-900">
            Please read this disclaimer carefully before using any recipes from this website.
          </p>

          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">No Medical Advice</h3>
              <p>
                The information and recipes presented on this website are intended only to provide general
                information for meal planning and nutritional tracking. This content does not constitute
                medical advice and should not be used as a substitute for professional medical guidance,
                diagnosis, or treatment. The recipes and nutritional information have not been created or
                approved by medical professionals or registered dietitians.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Consult Healthcare Providers</h3>
              <p>
                Before starting a ketogenic diet, especially for therapeutic purposes, you should always
                consult with qualified healthcare professionals, including physicians, registered dietitians,
                or nutritionists who are familiar with ketogenic dietary therapy. Individual medical needs
                vary significantly, and what works for one person may not be appropriate or safe for another.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">FDA Status</h3>
              <p>
                The recipes and content on this website have not been evaluated or approved by the United
                States Food and Drug Administration (FDA) or any other regulatory agency. These recipes are
                not intended to diagnose, treat, cure, or prevent any disease or medical condition.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Accuracy and Calculations</h3>
              <p>
                While we strive to provide accurate nutritional calculations, the macro and ketogenic ratio
                calculations are based on user-provided data. We make no warranty, expressed or implied,
                with respect to the effectiveness, currency, completeness, applicability, or accuracy of
                the nutritional information. Actual nutritional values may vary based on:
              </p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>Variations in ingredient brands and sources</li>
                <li>Preparation and cooking methods</li>
                <li>Measurement accuracy</li>
                <li>Natural variations in food composition</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">User Responsibility</h3>
              <p>
                Users are solely responsible for verifying the accuracy of nutritional information and
                determining the suitability of any recipe for their individual needs. Always double-check
                calculations and measurements, especially when following a therapeutic ketogenic diet where
                precise ratios are critical for medical management.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Community-Submitted Content</h3>
              <p>
                This platform allows users to share recipes with the community. These recipes are submitted
                by individuals and have not been professionally reviewed or validated. Exercise caution and
                verify all nutritional information before using community-submitted recipes.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Limitation of Liability</h3>
              <p>
                By using this website and its recipes, you agree that the website operators, contributors,
                and affiliated parties shall not be held liable for any adverse effects, health complications,
                or other outcomes resulting from the use of recipes or information provided on this platform.
                This includes, but is not limited to, allergic reactions, nutritional deficiencies, or any
                medical complications arising from dietary choices.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Food Allergies and Sensitivities</h3>
              <p>
                Always check ingredient lists carefully for potential allergens. If you have food allergies,
                sensitivities, or intolerances, consult with your healthcare provider before trying new
                recipes. The website does not provide allergen warnings or substitution recommendations.
              </p>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-yellow-300">
            <p className="text-sm italic text-gray-600">
              By using this website and its recipes, you acknowledge that you have read, understood, and
              agree to this disclaimer. If you do not agree with these terms, please do not use the recipes
              or information provided on this platform.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
